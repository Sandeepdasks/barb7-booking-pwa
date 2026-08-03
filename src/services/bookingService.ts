import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { Booking, BookingStatus } from "../types/bookingRecord";
import { computeOccupiedSlots } from "../utils/serviceDurationEngine";
import { emitBookingEvent } from "./notificationEvents";
// ASSUMPTION — Firestore instance. Adjust this path to wherever your existing
// Firebase config exports `db` (commonly src/services/firebase.ts or
// src/lib/firebase.ts). This file does NOT initialize Firebase itself.
import { db } from "../lib/firebase";

const BOOKINGS = "bookings";
const SLOT_LOCKS = "slotLocks";

export class SlotTakenError extends Error {
  constructor() {
    super("This slot was just booked by another customer. Please choose a different time.");
    this.name = "SlotTakenError";
  }
}

// ARCHITECTURE NOTE (double-booking prevention):
// 03-Database.md's design note says a deterministic doc ID ({salonId}_{date}_
// {time}) makes double-booking prevention a plain create() that fails on
// conflict. That holds for fixed-length appointments, but with dynamic service
// durations one booking spans MULTIPLE base-grid slots, so a single doc ID
// can't cover it. Also, the Firestore CLIENT SDK cannot run queries inside a
// transaction — only individual doc reads — so "query for overlaps then write"
// is not expressible client-side.
//
// Reconciliation: keep the deterministic-ID idea, but as one lightweight
// slotLocks doc PER OCCUPIED BASE SLOT, ID `{salonId}_{date}_{HH:mm}`. The
// transaction reads every required lock doc, aborts if any exists, else writes
// all locks + the booking atomically. Satisfies both documents and works
// across devices/browsers.
function slotLockId(salonId: string, dateKey: string, time24: string): string {
  return `${salonId}_${dateKey}_${time24}`;
}

export interface CreateBookingInput {
  salonId: string;
  salonName: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  services: Booking["services"];
  totalDurationMinutes: number;
  appointmentDate: string;
  appointmentTime: string;
  appointmentEndTime: string;
  baseSlotIntervalMinutes: number;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const {
    appointmentDate,
    appointmentTime,
    totalDurationMinutes,
    baseSlotIntervalMinutes,
    salonId,
  } = input;

  const requiredSlots = computeOccupiedSlots(
    appointmentTime,
    totalDurationMinutes,
    baseSlotIntervalMinutes
  );

  const bookingRef = doc(collection(db, BOOKINGS));
  const nowIso = new Date().toISOString();

  const booking: Booking = {
    bookingId: bookingRef.id,
    salonId: input.salonId,
    salonName: input.salonName,
    customerId: input.customerId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    services: input.services,
    totalDurationMinutes: input.totalDurationMinutes,
    appointmentDate: input.appointmentDate,
    appointmentTime: input.appointmentTime,
    appointmentEndTime: input.appointmentEndTime,
    status: "confirmed",
    createdAt: nowIso,
    updatedAt: nowIso,
    cancelledAt: null,
  };

  await runTransaction(db, async (tx) => {
    const lockRefs = requiredSlots.map((slot) =>
      doc(db, SLOT_LOCKS, slotLockId(salonId, appointmentDate, slot))
    );

    // Read ALL locks before any write — Firestore transactions require every
    // read to precede every write.
    const lockSnaps = await Promise.all(lockRefs.map((ref) => tx.get(ref)));
    if (lockSnaps.some((snap) => snap.exists())) {
      throw new SlotTakenError();
    }

    lockRefs.forEach((ref, i) => {
      tx.set(ref, {
        salonId,
        date: appointmentDate,
        time: requiredSlots[i],
        bookingId: bookingRef.id,
        createdAt: serverTimestamp(),
      });
    });

    tx.set(bookingRef, { ...booking, createdAtServer: serverTimestamp() });
  });

  emitBookingEvent({ type: "booking.confirmed", booking });
  return booking;
}

// Releases the booking's slot locks so the times become bookable again, and
// marks the booking with an attributed cancellation status.
async function cancelBookingInternal(
  bookingId: string,
  status: Extract<BookingStatus, "cancelled_by_customer" | "cancelled_by_owner">,
  baseSlotIntervalMinutes: number
): Promise<Booking | null> {
  const bookingRef = doc(db, BOOKINGS, bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) return null;

  const booking = snap.data() as Booking;
  const nowIso = new Date().toISOString();

  const occupied = computeOccupiedSlots(
    booking.appointmentTime,
    booking.totalDurationMinutes,
    baseSlotIntervalMinutes
  );

  await runTransaction(db, async (tx) => {
    const lockRefs = occupied.map((slot) =>
      doc(db, SLOT_LOCKS, slotLockId(booking.salonId, booking.appointmentDate, slot))
    );
    // Read first, then write — only delete locks this booking actually owns,
    // so a lock already reassigned elsewhere is never clobbered.
    const lockSnaps = await Promise.all(lockRefs.map((ref) => tx.get(ref)));

    tx.update(bookingRef, { status, updatedAt: nowIso, cancelledAt: nowIso });

    lockSnaps.forEach((lockSnap, i) => {
      if (lockSnap.exists() && lockSnap.data()?.bookingId === bookingId) {
        tx.delete(lockRefs[i]);
      }
    });
  });

  const updated: Booking = { ...booking, status, updatedAt: nowIso, cancelledAt: nowIso };
  emitBookingEvent({
    type:
      status === "cancelled_by_customer"
        ? "booking.cancelled_by_customer"
        : "booking.cancelled_by_owner",
    booking: updated,
  });
  return updated;
}

export function cancelBookingByCustomer(bookingId: string, baseSlotIntervalMinutes: number) {
  return cancelBookingInternal(bookingId, "cancelled_by_customer", baseSlotIntervalMinutes);
}

// Data model is ready for the owner app — same lock-release path, different
// attributed status, and deliberately NOT gated by the customer's 2h window.
export function cancelBookingByOwner(bookingId: string, baseSlotIntervalMinutes: number) {
  return cancelBookingInternal(bookingId, "cancelled_by_owner", baseSlotIntervalMinutes);
}

// Real-time listener for one customer's bookings. Firestore keeps this live,
// so a cancellation on another device updates this list automatically.
export function subscribeToCustomerBookings(
  customerId: string,
  onData: (bookings: Booking[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, BOOKINGS), where("customerId", "==", customerId));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data() as Booking)),
    onError
  );
}

// One-shot fetch — used by pull-to-refresh. The onSnapshot listener above
// already keeps data current; this exists so the gesture has something to
// await and can show a spinner.
export async function fetchCustomerBookings(customerId: string): Promise<Booking[]> {
  const q = query(collection(db, BOOKINGS), where("customerId", "==", customerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Booking);
}

// Confirmed bookings for a salon+date — drives slot availability.
export async function fetchConfirmedBookingsForDate(
  salonId: string,
  dateKey: string
): Promise<Booking[]> {
  const q = query(
    collection(db, BOOKINGS),
    where("salonId", "==", salonId),
    where("appointmentDate", "==", dateKey),
    where("status", "==", "confirmed")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Booking);
}

export function subscribeToConfirmedBookingsForDate(
  salonId: string,
  dateKey: string,
  onData: (bookings: Booking[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, BOOKINGS),
    where("salonId", "==", salonId),
    where("appointmentDate", "==", dateKey),
    where("status", "==", "confirmed")
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data() as Booking)),
    onError
  );
}

// Exposed for the future owner app (mark completed / no_show).
export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  await updateDoc(doc(db, BOOKINGS, bookingId), {
    status,
    updatedAt: new Date().toISOString(),
  });
}
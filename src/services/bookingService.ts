import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { Booking, BookingStatus } from "../types/bookingRecord";
import { computeOccupiedSlots } from "../utils/serviceDurationEngine";
import { emitBookingEvent } from "./notificationEvents";
import { db } from "../lib/firebase";

const BOOKINGS = "bookings";
const APPOINTMENTS = "appointments";
const SLOT_LOCKS = "slotLocks";

export class SlotTakenError extends Error {
  constructor() {
    super(
      "This slot was just booked by another customer. Please choose a different time."
    );
    this.name = "SlotTakenError";
  }
}

function slotLockId(
  salonId: string,
  dateKey: string,
  time24: string
): string {
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

/**
 * Creates a customer booking.
 *
 * Writes all of these atomically:
 *
 * 1. bookings/{bookingId}
 *    - customer-facing booking record
 *
 * 2. appointments/{bookingId}
 *    - owner-facing schedule/dashboard record
 *
 * 3. slotLocks/{salonId_date_time}
 *    - one lock for each occupied base-grid slot
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<Booking> {
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

  // Use the same Firestore ID so both records are easy to keep in sync.
  const appointmentRef = doc(
    db,
    APPOINTMENTS,
    bookingRef.id
  );

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

    totalDurationMinutes:
      input.totalDurationMinutes,

    appointmentDate:
      input.appointmentDate,

    appointmentTime:
      input.appointmentTime,

    appointmentEndTime:
      input.appointmentEndTime,

    status: "confirmed",

    createdAt: nowIso,
    updatedAt: nowIso,

    cancelledAt: null,
  };

  await runTransaction(db, async (tx) => {
    const lockRefs = requiredSlots.map(
      (slot) =>
        doc(
          db,
          SLOT_LOCKS,
          slotLockId(
            salonId,
            appointmentDate,
            slot
          )
        )
    );

    /**
     * Firestore transactions require reads
     * before writes.
     */
    const lockSnaps = await Promise.all(
      lockRefs.map((ref) => tx.get(ref))
    );

    if (
      lockSnaps.some(
        (snap) => snap.exists()
      )
    ) {
      throw new SlotTakenError();
    }

    /**
     * Lock every occupied base-grid slot.
     */
    lockRefs.forEach((ref, i) => {
      tx.set(ref, {
        salonId,
        date: appointmentDate,
        time: requiredSlots[i],

        bookingId: bookingRef.id,
        appointmentId: bookingRef.id,

        type: "appointment",

        createdBy: input.customerId,
        createdAt: serverTimestamp(),
      });
    });

    /**
     * Customer-facing booking record.
     */
    tx.set(bookingRef, {
      ...booking,
      createdAtServer: serverTimestamp(),
    });

    /**
     * Owner-facing appointment record.
     *
     * This is what:
     * - Owner Dashboard
     * - Owner Schedule
     *
     * currently read.
     */
    tx.set(appointmentRef, {
      salonId: input.salonId,

      customerId: input.customerId,
      guestId: null,

      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,

      services: input.services,

      serviceName: input.services
        .map(
          (service) =>
            service.serviceName
        )
        .join(" + "),

      serviceId: input.services
        .map(
          (service) =>
            service.serviceId
        )
        .join(","),

      date: input.appointmentDate,
      time: input.appointmentTime,

      endTime:
        input.appointmentEndTime,

      durationMins:
        input.totalDurationMinutes,

      status: "confirmed",

      bookingSource: "online",

      bookingId: bookingRef.id,

      createdBy: input.customerId,
      createdAt: serverTimestamp(),

      cancelledAt: null,
      cancelledBy: null,
    });
  });

  emitBookingEvent({
    type: "booking.confirmed",
    booking,
  });

  return booking;
}

/**
 * Cancels a booking and releases all slot locks.
 *
 * Both customer-facing and owner-facing records
 * are updated together.
 */
async function cancelBookingInternal(
  bookingId: string,
  status: Extract<
    BookingStatus,
    | "cancelled_by_customer"
    | "cancelled_by_owner"
  >,
  baseSlotIntervalMinutes: number
): Promise<Booking | null> {
  const bookingRef = doc(
    db,
    BOOKINGS,
    bookingId
  );

  const appointmentRef = doc(
    db,
    APPOINTMENTS,
    bookingId
  );

  const snap = await getDoc(bookingRef);

  if (!snap.exists()) {
    return null;
  }

  const booking =
    snap.data() as Booking;

  const nowIso =
    new Date().toISOString();

  const occupied =
    computeOccupiedSlots(
      booking.appointmentTime,
      booking.totalDurationMinutes,
      baseSlotIntervalMinutes
    );

  await runTransaction(
    db,
    async (tx) => {
      const lockRefs =
        occupied.map((slot) =>
          doc(
            db,
            SLOT_LOCKS,
            slotLockId(
              booking.salonId,
              booking.appointmentDate,
              slot
            )
          )
        );

      /**
       * Read everything first.
       */
      const lockSnaps =
        await Promise.all(
          lockRefs.map((ref) =>
            tx.get(ref)
          )
        );

      const appointmentSnap =
        await tx.get(
          appointmentRef
        );

      /**
       * Update customer-facing booking.
       */
      tx.update(bookingRef, {
        status,
        updatedAt: nowIso,
        cancelledAt: nowIso,
      });

      /**
       * Update owner-facing appointment
       * if it exists.
       */
      if (
        appointmentSnap.exists()
      ) {
        tx.update(
          appointmentRef,
          {
            status,

            cancelledAt:
              serverTimestamp(),

            cancelledBy:
              status ===
              "cancelled_by_customer"
                ? booking.customerId
                : "owner",
          }
        );
      }

      /**
       * Release only locks belonging to
       * this booking.
       */
      lockSnaps.forEach(
        (lockSnap, i) => {
          if (
            lockSnap.exists() &&
            (
              lockSnap.data()
                ?.bookingId ===
                bookingId ||
              lockSnap.data()
                ?.appointmentId ===
                bookingId
            )
          ) {
            tx.delete(
              lockRefs[i]
            );
          }
        }
      );
    }
  );

  const updated: Booking = {
    ...booking,
    status,
    updatedAt: nowIso,
    cancelledAt: nowIso,
  };

  emitBookingEvent({
    type:
      status ===
      "cancelled_by_customer"
        ? "booking.cancelled_by_customer"
        : "booking.cancelled_by_owner",
    booking: updated,
  });

  return updated;
}

export function cancelBookingByCustomer(
  bookingId: string,
  baseSlotIntervalMinutes: number
) {
  return cancelBookingInternal(
    bookingId,
    "cancelled_by_customer",
    baseSlotIntervalMinutes
  );
}

export function cancelBookingByOwner(
  bookingId: string,
  baseSlotIntervalMinutes: number
) {
  return cancelBookingInternal(
    bookingId,
    "cancelled_by_owner",
    baseSlotIntervalMinutes
  );
}

/**
 * Real-time listener for one customer's bookings.
 */
export function subscribeToCustomerBookings(
  customerId: string,
  onData: (
    bookings: Booking[]
  ) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, BOOKINGS),
    where(
      "customerId",
      "==",
      customerId
    )
  );

  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map(
          (d) =>
            d.data() as Booking
        )
      ),
    onError
  );
}

/**
 * One-shot fetch for My Bookings.
 */
export async function fetchCustomerBookings(
  customerId: string
): Promise<Booking[]> {
  const q = query(
    collection(db, BOOKINGS),
    where(
      "customerId",
      "==",
      customerId
    )
  );

  const snap =
    await getDocs(q);

  return snap.docs.map(
    (d) =>
      d.data() as Booking
  );
}

/**
 * Confirmed customer bookings
 * for a salon/date.
 */
export async function fetchConfirmedBookingsForDate(
  salonId: string,
  dateKey: string
): Promise<Booking[]> {
  const q = query(
    collection(db, BOOKINGS),

    where(
      "salonId",
      "==",
      salonId
    ),

    where(
      "appointmentDate",
      "==",
      dateKey
    ),

    where(
      "status",
      "==",
      "confirmed"
    )
  );

  const snap =
    await getDocs(q);

  return snap.docs.map(
    (d) =>
      d.data() as Booking
  );
}

export function subscribeToConfirmedBookingsForDate(
  salonId: string,
  dateKey: string,
  onData: (
    bookings: Booking[]
  ) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, BOOKINGS),

    where(
      "salonId",
      "==",
      salonId
    ),

    where(
      "appointmentDate",
      "==",
      dateKey
    ),

    where(
      "status",
      "==",
      "confirmed"
    )
  );

  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map(
          (d) =>
            d.data() as Booking
        )
      ),
    onError
  );
}

/**
 * Status update used by future admin/owner flows.
 *
 * Keeps both Firestore records synchronized.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  const bookingRef = doc(
    db,
    BOOKINGS,
    bookingId
  );

  const appointmentRef = doc(
    db,
    APPOINTMENTS,
    bookingId
  );

  const nowIso =
    new Date().toISOString();

  await runTransaction(
    db,
    async (tx) => {
      const appointmentSnap =
        await tx.get(
          appointmentRef
        );

      tx.update(
        bookingRef,
        {
          status,
          updatedAt: nowIso,
        }
      );

      if (
        appointmentSnap.exists()
      ) {
        tx.update(
          appointmentRef,
          {
            status,
          }
        );
      }
    }
  );
}
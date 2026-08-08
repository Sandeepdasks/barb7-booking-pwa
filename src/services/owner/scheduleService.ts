// Owner schedule service — direct Firestore client writes.
//
// KNOWN GAP vs. frozen architecture: 04-APIs.md specifies booking creation/status-change/
// cancellation run through Cloud Functions server-side (Phase 7, not yet built). This module
// is the interim client-side implementation for the owner-screens phase. Deterministic-ID +
// transaction writes preserve the double-booking guard client-side, but Firestore Rules
// (Phase 6) must still restrict these writes to authenticated owners — until then, protection
// is route-level only (OwnerProtectedRoute), not rule-level.
//
// COLLECTIONS (2026-08-08, confirmed): `slotLocks` is the ONE shared collision-guard collection
// for both customer bookings (written by the customer Cloud Function — not in this codebase)
// and owner-side writes here, distinguished by `type: 'appointment' | 'owner_blocked'`. This
// supersedes an earlier `blockedSlots`-as-separate-collection assumption. `appointments` is
// still the separate collection the Owner Schedule renders event cards from — slotLocks are
// never directly rendered except the `owner_blocked` subset (see scheduleTimeline.ts).
//
// CROSS-SYSTEM NOTE: because slotLocks is genuinely shared, this file's writes are correctly
// visible to (and must correctly respect) the customer Cloud Function's own slotLocks writes —
// no separate reconciliation needed, unlike the earlier blockedSlots design.

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment, AppointmentStatus, SlotLock } from '@/types/owner';
import { ACTIVE_APPOINTMENT_STATUSES, OPERATIONAL_APPOINTMENT_STATUSES } from '@/types/owner';
import { addMinutesToTime, enumerateSubSlots, SLOT_MINUTES } from '@/utils/scheduleTimeline';

export class SlotUnavailableError extends Error {
  constructor(message = 'This slot is already booked or blocked.') {
    super(message);
  }
}

// --- Reads ------------------------------------------------------------

// Filters to operational statuses client-side (see types/owner.ts OPERATIONAL_APPOINTMENT_STATUSES)
// so cancelled_by_customer / cancelled_by_owner never reach the schedule UI, in real time, without
// an extra composite index (reuses the existing salonId+date+orderBy(time) index).
export function subscribeAppointmentsForDate(
  salonId: string,
  date: string,
  cb: (appointments: Appointment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'appointments'),
    where('salonId', '==', salonId),
    where('date', '==', date),
    orderBy('time', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ appointmentId: d.id, ...d.data() } as Appointment));
    cb(all.filter((a) => OPERATIONAL_APPOINTMENT_STATUSES.includes(a.status)));
  });
}

// Returns EVERY slotLock for the date, both types — callers filter for their own purpose
// (Owner Schedule keeps only 'owner_blocked' for rendering; Add Booking's availability engine
// uses all of them, since a customer's own booking lock must block owner double-booking too).
export function subscribeSlotLocksForDate(
  salonId: string,
  date: string,
  cb: (locks: SlotLock[]) => void
): Unsubscribe {
  const q = query(collection(db, 'slotLocks'), where('salonId', '==', salonId), where('date', '==', date));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ lockId: d.id, ...d.data() } as SlotLock)));
  });
}

// --- Internal helpers ---------------------------------------------------

function slotLockRef(salonId: string, date: string, time: string) {
  return doc(db, 'slotLocks', `${salonId}_${date}_${time}`);
}

function refsForSpan(salonId: string, date: string, startTime: string, durationMins: number) {
  return enumerateSubSlots(startTime, durationMins).map((t) => slotLockRef(salonId, date, t));
}

// --- Create (walk-in / phone / WhatsApp) ---------------------------------

export interface CreateWalkInInput {
  salonId: string;
  date: string;
  time: string;
  serviceId: string;
  serviceName: string;
  durationMins: number;
  customerName: string;
  customerPhone: string;
  createdBy: string; // owner uid
}

// Powers "Add Booking". Reserves every 15-min sub-slot the appointment spans (not just its
// start minute) as `type: 'appointment'` slotLocks, so any other create/block attempt — owner
// or customer side — touching the same span is correctly rejected.
export async function createWalkInAppointment(input: CreateWalkInInput): Promise<string> {
  const appointmentId = `${input.salonId}_${input.date}_${input.time}`;
  const apptRef = doc(db, 'appointments', appointmentId);
  const subSlotTimes = enumerateSubSlots(input.time, input.durationMins);
  const lockRefs = subSlotTimes.map((t) => slotLockRef(input.salonId, input.date, t));

  await runTransaction(db, async (tx) => {
    const [apptSnap, ...lockSnaps] = await Promise.all([tx.get(apptRef), ...lockRefs.map((r) => tx.get(r))]);

    if (apptSnap.exists() && ACTIVE_APPOINTMENT_STATUSES.includes(apptSnap.data().status)) {
      throw new SlotUnavailableError();
    }
    if (lockSnaps.some((s) => s.exists())) {
      throw new SlotUnavailableError();
    }

    tx.set(apptRef, {
      salonId: input.salonId,
      customerId: null,
      guestId: null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: null,
      serviceId: input.serviceId,
      serviceName: input.serviceName,
      date: input.date,
      time: input.time,
      endTime: addMinutesToTime(input.time, input.durationMins),
      durationMins: input.durationMins,
      status: 'confirmed',
      bookingSource: 'walk-in',
      createdBy: input.createdBy,
      createdAt: serverTimestamp(),
      cancelledAt: null,
      cancelledBy: null,
    });

    subSlotTimes.forEach((t, i) => {
      tx.set(lockRefs[i], {
        salonId: input.salonId,
        date: input.date,
        time: t,
        durationMins: SLOT_MINUTES,
        type: 'appointment',
        reason: null,
        sourceAppointmentId: appointmentId,
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
      });
    });
  });

  return appointmentId;
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  await updateDoc(doc(db, 'appointments', appointmentId), { status });
}

// --- Cancel & Block --------------------------------------------------

// Powers "Cancel & Block Slot": cancels the appointment and locks its FULL original span as
// `type: 'owner_blocked'` (one sub-doc per 15-min increment, tagged with sourceAppointmentId
// for grouping/release/conversion) in one atomic batch.
export async function cancelAndBlockAppointment(
  appointment: Pick<Appointment, 'appointmentId' | 'salonId' | 'date' | 'time' | 'durationMins'>,
  ownerUid: string,
  reason = 'Cancelled booking'
) {
  const batch = writeBatch(db);
  const apptRef = doc(db, 'appointments', appointment.appointmentId);

  batch.update(apptRef, {
    status: 'cancelled_by_owner',
    cancelledAt: serverTimestamp(),
    cancelledBy: ownerUid,
  });

  enumerateSubSlots(appointment.time, appointment.durationMins).forEach((t) => {
    batch.set(slotLockRef(appointment.salonId, appointment.date, t), {
      salonId: appointment.salonId,
      date: appointment.date,
      time: t,
      durationMins: SLOT_MINUTES,
      type: 'owner_blocked',
      reason,
      sourceAppointmentId: appointment.appointmentId,
      createdBy: ownerUid,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

// --- Release ------------------------------------------------------------

// Powers "Release Slot". Deletes every sub-doc in the group (recomputed deterministically from
// the group's own start/end — no query needed) so a multi-slot block disappears in one action.
export async function releaseBlockedGroup(group: {
  salonId: string;
  date: string;
  startTime: string;
  durationMins: number;
}) {
  const batch = writeBatch(db);
  enumerateSubSlots(group.startTime, group.durationMins).forEach((t) => {
    batch.delete(slotLockRef(group.salonId, group.date, t));
  });
  await batch.commit();
}

// --- Convert a blocked period into an owner booking -----------------------

export interface ConvertBlockedGroupInput {
  group: { salonId: string; date: string; startTime: string; durationMins: number };
  booking: {
    time: string;
    serviceId: string;
    serviceName: string;
    durationMins: number;
    customerName: string;
    customerPhone: string;
  };
  ownerUid: string;
}

// Powers "Add Booking" from a Blocked Slot Details sheet. Single transaction: release the
// ENTIRE original block span + create the new appointment + reserve only the sub-slots the new
// booking actually needs (as `type: 'appointment'`). Any leftover portion of the original span
// not consumed by the new booking is intentionally freed back to availability.
//
// Also checks the NEW span for conflicts with anything OTHER than the group being released (a
// gap in the previous version — a new duration extending past the original block's end wasn't
// checked against locks beyond that end) — fixed here, excluding the old group's own lock ids
// from that check so converting the owner's own block never self-rejects.
export async function convertBlockedSlotToOwnerBooking(input: ConvertBlockedGroupInput): Promise<string> {
  const { group, booking, ownerUid } = input;
  const appointmentId = `${group.salonId}_${group.date}_${booking.time}`;
  const apptRef = doc(db, 'appointments', appointmentId);
  const oldLockRefs = refsForSpan(group.salonId, group.date, group.startTime, group.durationMins);
  const oldLockIds = new Set(oldLockRefs.map((r) => r.id));
  const newSubSlotTimes = enumerateSubSlots(booking.time, booking.durationMins);
  const newLockRefs = newSubSlotTimes.map((t) => slotLockRef(group.salonId, group.date, t));

  await runTransaction(db, async (tx) => {
    const [apptSnap, ...newLockSnaps] = await Promise.all([
      tx.get(apptRef),
      ...newLockRefs.map((r) => tx.get(r)),
    ]);

    if (apptSnap.exists() && ACTIVE_APPOINTMENT_STATUSES.includes(apptSnap.data().status)) {
      throw new SlotUnavailableError();
    }

    // A new-span sub-slot conflicts only if it's occupied AND not one of the old group's own
    // locks (those are being released in this same transaction, so they don't count).
    const hasExternalConflict = newLockSnaps.some((snap) => snap.exists() && !oldLockIds.has(snap.ref.id));
    if (hasExternalConflict) {
      throw new SlotUnavailableError();
    }

    oldLockRefs.forEach((ref) => tx.delete(ref));

    tx.set(apptRef, {
      salonId: group.salonId,
      customerId: null,
      guestId: null,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: null,
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      date: group.date,
      time: booking.time,
      endTime: addMinutesToTime(booking.time, booking.durationMins),
      durationMins: booking.durationMins,
      status: 'confirmed',
      bookingSource: 'walk-in',
      createdBy: ownerUid,
      createdAt: serverTimestamp(),
      cancelledAt: null,
      cancelledBy: null,
    });

    newSubSlotTimes.forEach((t, i) => {
      tx.set(newLockRefs[i], {
        salonId: group.salonId,
        date: group.date,
        time: t,
        durationMins: SLOT_MINUTES,
        type: 'appointment',
        reason: null,
        sourceAppointmentId: appointmentId,
        createdBy: ownerUid,
        createdAt: serverTimestamp(),
      });
    });
  });

  return appointmentId;
}

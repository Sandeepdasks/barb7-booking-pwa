import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import type { WorkingHours, WorkingHoursDay, Weekday } from '@/types/owner';

import {
  DEFAULT_WORKING_HOURS,
} from '@/constants/businessHours';

/**
 * NORMALIZATION BOUNDARY (2026-08-08, critical fix)
 * ---------------------------------------------------------------------------
 * The LIVE Firestore `workingHours/{salonId}` document uses a different field
 * shape than the app's canonical `WorkingHours` type:
 *
 *   Firestore (raw):        { isClosed, openTime, closeTime }  per day
 *                            lunchBreak: { start, end }
 *                            slotIntervalMinutes
 *
 *   App-wide (canonical):   { start, end, closed }             per day
 *                            breakStart, breakEnd
 *                            (types/owner.ts — consumed by OwnerSchedulePage,
 *                            CalendarTimeline, OwnerAddBookingPage, and the
 *                            Working Hours settings page)
 *
 * This file is the ONLY place that boundary is crossed. Every other consumer
 * in the app keeps reading/writing the canonical shape exactly as before —
 * this service's public functions (subscribeWorkingHours / getWorkingHours /
 * saveWorkingHours) keep their existing signatures and return type unchanged,
 * so useWorkingHours.ts and everything built on it needs ZERO changes.
 *
 * Writes go back through the SAME mapping in reverse, so only
 * isClosed/openTime/closeTime/lunchBreak/slotIntervalMinutes are ever written
 * — start/end/closed are never persisted, so no second/competing schema gets
 * written into the document via merge:true.
 */

interface RawDaySchedule {
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

interface RawLunchBreak {
  start: string;
  end: string;
}

interface RawWorkingHoursDoc {
  monday: RawDaySchedule;
  tuesday: RawDaySchedule;
  wednesday: RawDaySchedule;
  thursday: RawDaySchedule;
  friday: RawDaySchedule;
  saturday: RawDaySchedule;
  sunday: RawDaySchedule;
  lunchBreak?: RawLunchBreak;
  slotIntervalMinutes?: number;
  updatedAt?: unknown;
}

const DAY_KEYS: Weekday[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

function rawDayToCanonical(raw: RawDaySchedule): WorkingHoursDay {
  return { start: raw.openTime, end: raw.closeTime, closed: raw.isClosed };
}

function canonicalDayToRaw(day: WorkingHoursDay): RawDaySchedule {
  return { isClosed: day.closed, openTime: day.start, closeTime: day.end };
}

function toCanonical(salonId: string, raw: RawWorkingHoursDoc): WorkingHours {
  const canonical = { salonId } as WorkingHours;
  for (const dayKey of DAY_KEYS) {
    canonical[dayKey] = rawDayToCanonical(raw[dayKey]);
  }
  canonical.breakStart = raw.lunchBreak?.start ?? DEFAULT_WORKING_HOURS.breakStart;
  canonical.breakEnd = raw.lunchBreak?.end ?? DEFAULT_WORKING_HOURS.breakEnd;
  canonical.slotIntervalMinutes = raw.slotIntervalMinutes;
  canonical.updatedAt = raw.updatedAt ?? null;
  return canonical;
}

function toRaw(hours: Omit<WorkingHours, 'salonId' | 'updatedAt'>): Omit<RawWorkingHoursDoc, 'updatedAt'> {
  const raw = {} as Omit<RawWorkingHoursDoc, 'updatedAt'>;
  for (const dayKey of DAY_KEYS) {
    raw[dayKey] = canonicalDayToRaw(hours[dayKey]);
  }
  raw.lunchBreak = { start: hours.breakStart, end: hours.breakEnd };
  raw.slotIntervalMinutes = hours.slotIntervalMinutes;
  return raw;
}

/**
 * Realtime working-hours listener.
 *
 * If the salon does not yet have a Firestore workingHours
 * document, use DEFAULT_WORKING_HOURS (already canonical-shaped).
 */
export function subscribeWorkingHours(
  salonId: string,
  cb: (hours: WorkingHours) => void,
  onError?: (
    error: FirestoreError
  ) => void
): Unsubscribe {
  const ref = doc(
    db,
    'workingHours',
    salonId
  );

  return onSnapshot(
    ref,

    // Success
    (snap) => {
      if (snap.exists()) {
        cb(toCanonical(salonId, snap.data() as RawWorkingHoursDoc));
        return;
      }

      /**
       * No Firestore record yet.
       * Use project defaults.
       */
      cb({
        salonId,
        ...DEFAULT_WORKING_HOURS,
        updatedAt: null,
      });
    },

    // Firestore error
    (error) => {
      console.error(
        'Working hours listener failed:',
        error
      );

      onError?.(error);
    }
  );
}

/**
 * One-time read.
 */
export async function getWorkingHours(
  salonId: string
): Promise<WorkingHours> {
  const ref = doc(
    db,
    'workingHours',
    salonId
  );

  const snap =
    await getDoc(ref);

  if (snap.exists()) {
    return toCanonical(salonId, snap.data() as RawWorkingHoursDoc);
  }

  return {
    salonId,
    ...DEFAULT_WORKING_HOURS,
    updatedAt: null,
  };
}

/**
 * Save owner working hours. Converts the canonical shape back to the raw
 * Firestore shape before writing — see the normalization boundary note above.
 */
export async function saveWorkingHours(
  salonId: string,
  hours: Omit<
    WorkingHours,
    'salonId' | 'updatedAt'
  >
): Promise<void> {
  await setDoc(
    doc(
      db,
      'workingHours',
      salonId
    ),
    {
      ...toRaw(hours),
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

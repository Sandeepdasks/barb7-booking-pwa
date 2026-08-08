// Time-grid math + availability engine for the Owner Schedule day view
// and Owner Add Booking form.
//
// Internal Firestore/storage values remain 24-hour "HH:mm" strings.
// This module handles:
// - 12-hour display formatting
// - calendar geometry
// - working-hours time generation
// - 15-minute slot calculations
// - owner/customer occupancy checks

import type {
  BlockedEventGroup,
  SlotLock,
  SlotLockType,
  Weekday,
  WorkingHoursDay,
} from '@/types/owner';

/* ------------------------------------------------------------------
   CONSTANTS
------------------------------------------------------------------- */

export const PIXELS_PER_MINUTE = 2;
export const SLOT_MINUTES = 15;
export const MIN_EVENT_HEIGHT_PX = 26;

/* ------------------------------------------------------------------
   BASIC TIME HELPERS
------------------------------------------------------------------- */

export function parseHHMM(
  time: string | undefined | null
): number {
  if (!time || typeof time !== 'string') {
    return 0;
  }

  const parts = time.split(':');

  if (parts.length !== 2) {
    return 0;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return 0;
  }

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return 0;
  }

  return hours * 60 + minutes;
}

export function minutesToHHMM(
  totalMinutes: number
): string {
  const normalized =
    ((totalMinutes % 1440) + 1440) % 1440;

  const hours =
    Math.floor(normalized / 60);

  const minutes =
    normalized % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function addMinutesToTime(
  time: string,
  mins: number
): string {
  return minutesToHHMM(
    parseHHMM(time) + mins
  );
}

/* ------------------------------------------------------------------
   PRESENTATION FORMATTERS
------------------------------------------------------------------- */

export function formatTime12h(
  time: string
): string {
  const totalMinutes =
    parseHHMM(time);

  const hour24 =
    Math.floor(totalMinutes / 60);

  const minute =
    totalMinutes % 60;

  const period =
    hour24 >= 12 ? 'PM' : 'AM';

  const hour12 =
    hour24 % 12 === 0
      ? 12
      : hour24 % 12;

  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

export function formatRange12h(
  start: string,
  end: string
): string {
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}

export function formatDateReadable(
  date: string
): string {
  const [year, month, day] =
    date.split('-').map(Number);

  if (!year || !month || !day) {
    return date;
  }

  const value = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  return value.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }
  );
}

/* ------------------------------------------------------------------
   CALENDAR GEOMETRY
------------------------------------------------------------------- */

export interface EventGeometry {
  top: number;
  height: number;
}

export function getEventGeometry(
  gridStart: string,
  eventStart: string,
  durationMins: number
): EventGeometry {
  const minutesFromOpening =
    parseHHMM(eventStart) -
    parseHHMM(gridStart);

  return {
    top:
      minutesFromOpening *
      PIXELS_PER_MINUTE,

    height: Math.max(
      durationMins *
        PIXELS_PER_MINUTE,
      MIN_EVENT_HEIGHT_PX
    ),
  };
}

export function getGridHeightPx(
  gridStart:
    | string
    | undefined
    | null,
  gridEnd:
    | string
    | undefined
    | null
): number {
  if (!gridStart || !gridEnd) {
    return 0;
  }

  const start =
    parseHHMM(gridStart);

  const end =
    parseHHMM(gridEnd);

  if (end <= start) {
    return 0;
  }

  return (
    (end - start) *
    PIXELS_PER_MINUTE
  );
}

export function buildMajorGridTimes(
  gridStart: string,
  gridEnd: string,
  intervalMins = 30
): string[] {
  if (
    !gridStart ||
    !gridEnd ||
    intervalMins <= 0
  ) {
    return [];
  }

  const start =
    parseHHMM(gridStart);

  const end =
    parseHHMM(gridEnd);

  if (end <= start) {
    return [];
  }

  const times: string[] = [];

  for (
    let minute = start;
    minute <= end;
    minute += intervalMins
  ) {
    times.push(
      minutesToHHMM(minute)
    );
  }

  return times;
}

/* ------------------------------------------------------------------
   IST DATE / TIME
------------------------------------------------------------------- */

export function nowMinutesIST(): number {
  const parts =
    new Intl.DateTimeFormat(
      'en-GB',
      {
        timeZone:
          'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }
    ).formatToParts(new Date());

  const hour = Number(
    parts.find(
      (part) =>
        part.type === 'hour'
    )?.value ?? '0'
  );

  const minute = Number(
    parts.find(
      (part) =>
        part.type === 'minute'
    )?.value ?? '0'
  );

  return hour * 60 + minute;
}

export function todayIST(): string {
  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone:
        'Asia/Kolkata',
    }
  ).format(new Date());
}

/* ------------------------------------------------------------------
   WEEKDAY
------------------------------------------------------------------- */

const WEEKDAYS: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function weekdayForDate(
  date: string
): Weekday {
  const [year, month, day] =
    date.split('-').map(Number);

  if (!year || !month || !day) {
    return 'monday';
  }

  const value = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  return WEEKDAYS[
    value.getUTCDay()
  ];
}

/* ------------------------------------------------------------------
   15-MINUTE SUB-SLOTS
------------------------------------------------------------------- */

export function enumerateSubSlots(
  startTime: string,
  durationMins: number
): string[] {
  if (
    !startTime ||
    durationMins <= 0
  ) {
    return [];
  }

  const count = Math.max(
    1,
    Math.ceil(
      durationMins /
        SLOT_MINUTES
    )
  );

  const startMinutes =
    parseHHMM(startTime);

  return Array.from(
    {
      length: count,
    },
    (_, index) =>
      minutesToHHMM(
        startMinutes +
          index *
            SLOT_MINUTES
      )
  );
}

/* ------------------------------------------------------------------
   OWNER BLOCK GROUPING
------------------------------------------------------------------- */

export function groupOwnerBlockedSlots(
  slotLocks: SlotLock[]
): BlockedEventGroup[] {
  const blocked =
    slotLocks.filter(
      (lock) =>
        lock.type ===
        'owner_blocked'
    );

  const bySource =
    new Map<
      string,
      SlotLock[]
    >();

  const ungrouped:
    SlotLock[] = [];

  for (const lock of blocked) {
    if (
      lock.sourceAppointmentId
    ) {
      const list =
        bySource.get(
          lock.sourceAppointmentId
        ) ?? [];

      list.push(lock);

      bySource.set(
        lock.sourceAppointmentId,
        list
      );
    } else {
      ungrouped.push(lock);
    }
  }

  const groups:
    BlockedEventGroup[] = [];

  for (
    const [
      sourceAppointmentId,
      locks,
    ] of bySource
  ) {
    groups.push(
      toGroup(
        locks,
        sourceAppointmentId
      )
    );
  }

  ungrouped.sort(
    (a, b) =>
      a.time.localeCompare(
        b.time
      )
  );

  let run: SlotLock[] = [];

  const flushRun = () => {
    if (run.length > 0) {
      groups.push(
        toGroup(
          run,
          null
        )
      );
    }

    run = [];
  };

  for (
    const lock of ungrouped
  ) {
    const last =
      run[
        run.length - 1
      ];

    const lastEnd =
      last
        ? addMinutesToTime(
            last.time,
            last.durationMins ??
              SLOT_MINUTES
          )
        : null;

    if (
      last &&
      lastEnd === lock.time
    ) {
      run.push(lock);
    } else {
      flushRun();
      run = [lock];
    }
  }

  flushRun();

  return groups.sort(
    (a, b) =>
      a.startTime.localeCompare(
        b.startTime
      )
  );
}

function toGroup(
  locks: SlotLock[],
  sourceAppointmentId:
    | string
    | null
): BlockedEventGroup {
  const sorted = [
    ...locks,
  ].sort(
    (a, b) =>
      a.time.localeCompare(
        b.time
      )
  );

  const first =
    sorted[0];

  const last =
    sorted[
      sorted.length - 1
    ];

  const startTime =
    first.time;

  const endTime =
    addMinutesToTime(
      last.time,
      last.durationMins ??
        SLOT_MINUTES
    );

  return {
    sourceAppointmentId,

    salonId:
      first.salonId,

    date:
      first.date,

    startTime,

    endTime,

    durationMins:
      parseHHMM(endTime) -
      parseHHMM(startTime),

    reason:
      first.reason ?? null,

    lockIds:
      sorted.map(
        (lock) =>
          lock.lockId
      ),
  };
}

/* ------------------------------------------------------------------
   OWNER ADD BOOKING — AVAILABILITY
------------------------------------------------------------------- */

export type UnavailableReason =
  | 'booked'
  | 'owner_blocked'
  | 'lunch_break'
  | 'past';
  

export interface StartTimeOption {
  time: string;
  available: boolean;
  reason?: UnavailableReason;
}

/* ------------------------------------------------------------------
   OCCUPANCY MAP
------------------------------------------------------------------- */

function buildOccupancyMap(
  slotLocks: SlotLock[],
  excludeTimes: Set<string>
): Map<string, SlotLockType> {
  const map =
    new Map<
      string,
      SlotLockType
    >();

  for (const lock of slotLocks) {
    if (
      !lock.time ||
      excludeTimes.has(
        lock.time
      )
    ) {
      continue;
    }

    const lockType:
      SlotLockType =
      lock.type ??
      'appointment';

    map.set(
      lock.time,
      lockType
    );
  }

  return map;
}

/* ------------------------------------------------------------------
   LUNCH BREAK
------------------------------------------------------------------- */

function overlapsLunch(
  startTime: string,
  durationMins: number,
  breakStart?: string,
  breakEnd?: string
): boolean {
  if (
    !breakStart ||
    !breakEnd
  ) {
    return false;
  }

  const start =
    parseHHMM(startTime);

  const end =
    start + durationMins;

  const breakStartMinutes =
    parseHHMM(
      breakStart
    );

  const breakEndMinutes =
    parseHHMM(
      breakEnd
    );

  if (
    breakEndMinutes <=
    breakStartMinutes
  ) {
    return false;
  }

  return (
    start <
      breakEndMinutes &&
    end >
      breakStartMinutes
  );
}

/* ------------------------------------------------------------------
   GENERATE VALID OWNER START TIMES
------------------------------------------------------------------- */

export function generateValidStartTimes(
  workingHoursDay: WorkingHoursDay,
  durationMins: number,
  slotLocks: SlotLock[],
  options?: {

  breakStart?: string;

  breakEnd?: string;

  excludeTimes?: Set<string>;

  selectedDate?: string;

}
): StartTimeOption[] {
  /*
   * Actual Firestore Working Hours currently use:
   *
   * openTime
   * closeTime
   * isClosed
   *
   * Some owner schedule code still uses:
   *
   * start
   * end
   * closed
   *
   * Support both temporarily.
   */
  const day = workingHoursDay as WorkingHoursDay & {
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;

    start?: string;
    end?: string;
    closed?: boolean;
  };

  const isClosed =
    day.isClosed ??
    day.closed ??
    false;

  if (isClosed) {
    return [];
  }

  const openTime =
    day.openTime ??
    day.start;

  const closeTime =
    day.closeTime ??
    day.end;

  if (!openTime || !closeTime) {
    console.warn(
      'Missing working hours for selected day:',
      workingHoursDay
    );

    return [];
  }

  if (
    !Number.isFinite(durationMins) ||
    durationMins <= 0
  ) {
    return [];
  }

  const openMins =
    parseHHMM(openTime);

  const closeMins =
    parseHHMM(closeTime);

  if (
    closeMins <=
    openMins
  ) {
    return [];
  }

  const occupancy =
    buildOccupancyMap(
      slotLocks ?? [],
      options?.excludeTimes ??
        new Set<string>()
    );

  const results:
    StartTimeOption[] = [];

  for (
    let current = openMins;
    current + durationMins <=
    closeMins;
    current += SLOT_MINUTES
  ) {
    const startTime =
      minutesToHHMM(current);

      const isToday =
      options?.selectedDate === todayIST();

    if (
      isToday &&
      current <= nowMinutesIST()
    ) {
      results.push({
        time: startTime,
        available: false,
        reason: 'past',
      });

      continue;
    }

    const subSlots =
      enumerateSubSlots(
        startTime,
        durationMins
      );
      

    const occupiedSubSlot =
      subSlots.find(
        (slot) =>
          occupancy.has(slot)
      );

    if (occupiedSubSlot) {
      const lockType =
        occupancy.get(
          occupiedSubSlot
        );

      const reason:
        UnavailableReason =
        lockType ===
        'owner_blocked'
          ? 'owner_blocked'
          : 'booked';

      results.push({
        time:
          startTime,

        available:
          false,

        reason,
      });

      continue;
    }

    if (
      overlapsLunch(
        startTime,
        durationMins,
        options?.breakStart,
        options?.breakEnd
      )
    ) {
      results.push({
        time:
          startTime,

        available:
          false,

        reason:
          'lunch_break',
      });

      continue;
    }

    results.push({
      time:
        startTime,

      available:
        true,
    });
  }

  return results;
}
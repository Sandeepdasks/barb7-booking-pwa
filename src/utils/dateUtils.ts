import { WeekdayKey } from "../types/workingHours";
import { to12h } from "./slotGenerator";

const WEEKDAYS: WeekdayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Single source of truth for weekday/month names (title case). Every other
// casing (e.g. the uppercase vertical date cards) derives from these via
// .toUpperCase() so they can never drift out of sync with each other.
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type BookableDayKey = "today" | "tomorrow" | "dayAfter";

export interface BookableDay {
  key: BookableDayKey;
  date: Date;
  dateKey: string; // YYYY-MM-DD
  weekday: WeekdayKey;
  // Display-only fields for the BookMyShow-style VERTICAL date card
  // (components/booking/DateTabs.tsx) — that's a distinct 3-line layout, not
  // the "Sun, 02 Aug" inline format used everywhere else, so it keeps its own
  // split fields. Values are sourced from the same WEEKDAY_NAMES/MONTH_NAMES
  // arrays as formatDisplayDate below, just uppercased, so the two never show
  // different weekday/month names for the same date.
  weekdayShort: string; // "THU"
  dayNum: string; // "30"
  monthShort: string; // "JUL"
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Customer booking window is fixed at today/tomorrow/day-after (01-Requirements
// maxBookingDaysAhead = 2). Display-only — Cloud Functions re-validate this
// server-side against IST, never trusting client device time.
export function getBookableDays(now: Date = new Date()): BookableDay[] {
  const keys: BookableDayKey[] = ["today", "tomorrow", "dayAfter"];

  return keys.map((key, offset) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return {
      key,
      date,
      dateKey: toDateKey(date),
      weekday: WEEKDAYS[date.getDay()],
      weekdayShort: WEEKDAY_NAMES[date.getDay()].toUpperCase(),
      dayNum: String(date.getDate()).padStart(2, "0"),
      monthShort: MONTH_NAMES[date.getMonth()].toUpperCase(),
    };
  });
}

// ---------------------------------------------------------------------------
// SHARED DISPLAY FORMATTERS — the only place booking dates/times are turned
// into user-facing strings. Every screen, popup, card, toast, and the email
// template import from here (or re-export it, see formatDisplayTime) instead
// of formatting dates/times themselves. Storage format is untouched by any of
// this: Firestore keeps YYYY-MM-DD / 24h HH:mm exactly as before — these
// functions only run at render/send time.
// ---------------------------------------------------------------------------

// IST is a fixed UTC+5:30 offset with no daylight saving — safe to hardcode.
const IST_OFFSET_MINUTES = 5 * 60 + 30;

// Absolute epoch ms for a YYYY-MM-DD + HH:mm pair, interpreted as IST — NOT
// the viewer's local timezone. Because the result is an absolute instant, a
// direct comparison against Date.now() is correct no matter what timezone the
// customer's device is set to. Used for the Upcoming/Past cutoff below.
export function toIstEpochMs(dateKey: string, time24: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [h, min] = time24.split(":").map(Number);
  return Date.UTC(y, m - 1, d, h, min) - IST_OFFSET_MINUTES * 60000;
}

// "Sun, 02 Aug" — the one date format used everywhere in the customer app.
// Weekday is computed via Date.UTC rather than local Date parsing: a plain
// Y-M-D string fed through `new Date(y, m-1, d)` is parsed in the BROWSER's
// local timezone, which can land on the wrong calendar day (and therefore the
// wrong weekday name) for viewers west of IST. Date.UTC sidesteps that.
export function formatDisplayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const weekday = WEEKDAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const month = MONTH_NAMES[m - 1];
  return `${weekday}, ${String(d).padStart(2, "0")} ${month}`;
}

// "9:30 AM" — re-exported (not reimplemented) from slotGenerator.ts, which
// already needed this exact format for slot-chip labels. Keeping one
// implementation means the grid and every other screen can never disagree.
export { to12h as formatDisplayTime };

// "9:30 AM – 10:00 AM" — en dash, per spec.
export function formatDisplayTimeRange(start24: string, end24: string): string {
  return `${to12h(start24)} – ${to12h(end24)}`;
}
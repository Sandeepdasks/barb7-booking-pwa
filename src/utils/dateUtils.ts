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

const WEEKDAY_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type BookableDayKey =
  | "today"
  | "tomorrow"
  | "dayAfter";

export interface BookableDay {
  key: BookableDayKey;
  date: Date;
  dateKey: string;
  weekday: WeekdayKey;
  weekdayShort: string;
  dayNum: string;
  monthShort: string;
}

/* ------------------------------------------------------------------
   IST DATE HELPERS
------------------------------------------------------------------- */

/**
 * Returns today's calendar date in India, regardless of the
 * browser/device timezone.
 *
 * Example:
 *
 * At 12:15 AM IST on 09 Aug:
 *
 * UTC may still be 08 Aug,
 * but this correctly returns:
 *
 * {
 *   year: 2026,
 *   month: 8,
 *   day: 9
 * }
 */
function getISTDateParts(
  value: Date = new Date()
): {
  year: number;
  month: number;
  day: number;
} {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(value);

  const year = Number(
    parts.find(
      (part) =>
        part.type === "year"
    )?.value
  );

  const month = Number(
    parts.find(
      (part) =>
        part.type === "month"
    )?.value
  );

  const day = Number(
    parts.find(
      (part) =>
        part.type === "day"
    )?.value
  );

  return {
    year,
    month,
    day,
  };
}

/**
 * Convert a UTC-midnight calendar Date into YYYY-MM-DD.
 *
 * The Date objects created by getBookableDays() are deliberately
 * UTC-midnight dates used only for safe calendar arithmetic.
 */
function toDateKey(
  date: Date
): string {
  const year =
    date.getUTCFullYear();

  const month =
    date.getUTCMonth() + 1;

  const day =
    date.getUTCDate();

  return `${year}-${String(
    month
  ).padStart(
    2,
    "0"
  )}-${String(
    day
  ).padStart(
    2,
    "0"
  )}`;
}

/* ------------------------------------------------------------------
   BOOKABLE DAYS
------------------------------------------------------------------- */

/**
 * Customer booking window:
 *
 * today
 * tomorrow
 * day-after-tomorrow
 *
 * IMPORTANT:
 * All calendar calculations are based on IST.
 *
 * We intentionally avoid:
 *
 * date.toISOString().slice(0, 10)
 *
 * on a locally-created Date, because around midnight IST that can
 * return the PREVIOUS UTC calendar date.
 */
export function getBookableDays(
  now: Date = new Date()
): BookableDay[] {
  const keys:
    BookableDayKey[] = [
      "today",
      "tomorrow",
      "dayAfter",
    ];

  const {
    year,
    month,
    day,
  } =
    getISTDateParts(
      now
    );

  /*
   * UTC midnight is used only as a safe calendar container.
   *
   * It prevents browser timezone differences from changing the
   * weekday/date while we increment days.
   */
  const baseDate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return keys.map(
    (
      key,
      offset
    ) => {
      const date =
        new Date(
          baseDate
        );

      date.setUTCDate(
        date.getUTCDate() +
          offset
      );

      const weekdayIndex =
        date.getUTCDay();

      const monthIndex =
        date.getUTCMonth();

      const dayNumber =
        date.getUTCDate();

      return {
        key,

        date,

        dateKey:
          toDateKey(
            date
          ),

        weekday:
          WEEKDAYS[
            weekdayIndex
          ],

        weekdayShort:
          WEEKDAY_NAMES[
            weekdayIndex
          ].toUpperCase(),

        dayNum:
          String(
            dayNumber
          ).padStart(
            2,
            "0"
          ),

        monthShort:
          MONTH_NAMES[
            monthIndex
          ].toUpperCase(),
      };
    }
  );
}

/* ------------------------------------------------------------------
   SHARED DISPLAY FORMATTERS
------------------------------------------------------------------- */

const IST_OFFSET_MINUTES =
  5 * 60 + 30;

/**
 * Convert YYYY-MM-DD + HH:mm, interpreted as IST,
 * into an absolute epoch timestamp.
 */
export function toIstEpochMs(
  dateKey: string,
  time24: string
): number {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(Number);

  const [
    hours,
    minutes,
  ] =
    time24
      .split(":")
      .map(Number);

  return (
    Date.UTC(
      year,
      month - 1,
      day,
      hours,
      minutes
    ) -
    IST_OFFSET_MINUTES *
      60000
  );
}

/**
 * Example:
 *
 * 2026-08-09
 *
 * ->
 *
 * Sun, 09 Aug
 */
export function formatDisplayDate(
  dateKey: string
): string {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(Number);

  const weekdayIndex =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    ).getUTCDay();

  const weekday =
    WEEKDAY_NAMES[
      weekdayIndex
    ];

  const monthName =
    MONTH_NAMES[
      month - 1
    ];

  return `${weekday}, ${String(
    day
  ).padStart(
    2,
    "0"
  )} ${monthName}`;
}

/**
 * Re-export the existing shared 12-hour formatter.
 */
export {
  to12h as formatDisplayTime,
};

/**
 * Example:
 *
 * 09:30 – 10:00
 *
 * ->
 *
 * 9:30 AM – 10:00 AM
 */
export function formatDisplayTimeRange(
  start24: string,
  end24: string
): string {
  return `${to12h(
    start24
  )} – ${to12h(
    end24
  )}`;
}
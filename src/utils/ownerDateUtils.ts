/**
 * NOTE: project spec says "use the same date utilities already present in
 * the project." Repo access unavailable here, so this file is a
 * self-contained fallback with the exact functions Milestone 1 needs.
 * Before merging: check src/utils (or equivalent) for an existing date
 * helper module — if one exists, delete this file and import from there
 * instead, to avoid duplicate utilities.
 */

const pad = (n: number): string => String(n).padStart(2, '0');

/** Format a Date as YYYY-MM-DD (local calendar date, no TZ conversion). */
export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (d: Date, days: number): Date => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const isSameDate = (a: Date, b: Date): boolean => toISODate(a) === toISODate(b);

/** "Today • Tue, 05 Aug" style label relative to `today`. */
export const formatScheduleHeading = (target: Date, today: Date): string => {
  const dayLabel = isSameDate(target, today)
    ? 'Today'
    : isSameDate(target, addDays(today, 1))
      ? 'Tomorrow'
      : isSameDate(target, addDays(today, -1))
        ? 'Yesterday'
        : null;

  const weekday = target.toLocaleDateString('en-IN', { weekday: 'short' });
  const day = pad(target.getDate());
  const month = target.toLocaleDateString('en-IN', { month: 'short' });

  return dayLabel ? `${dayLabel} • ${weekday}, ${day} ${month}` : `${weekday}, ${day} ${month}`;
};

/** "HH:mm" -> minutes since midnight, for sorting/comparison. */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

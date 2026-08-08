import { SessionWindow, DaySessions } from "../types/workingHours";

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toTimeStr(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Generates 24h "HH:mm" BASE GRID slot start times from a session window +
// the base slot interval (e.g. 60 min) — this is the visual list customers
// see, independent of any specific service's actual duration. Inclusive of
// the end time (09:00–13:00 @60min -> 09:00,10:00,11:00,12:00,13:00), matching
// the owner-config spec example.
export function generateSlotsForSession(
  session: SessionWindow,
  baseSlotIntervalMinutes: number
): string[] {
  const start = toMinutes(session.start);
  const end = toMinutes(session.end);
  const slots: string[] = [];
  for (let t = start; t <= end; t += baseSlotIntervalMinutes) {
    slots.push(toTimeStr(t));
  }
  return slots;
}

// Computes a slot's end time from its start + duration, for display as a
// range ("10:00 AM – 11:00 AM") in the booking summary card.
export function getSlotEndTime(time24: string, durationMinutes: number): string {
  return toTimeStr(toMinutes(time24) + durationMinutes);
}

// Derives the "9:00 AM – 9:00 PM" style strip from a day's session config —
// earliest session start to latest session end. Owner-configurable: changing
// any session window here updates the strip with zero component changes.
export function getDayHoursLabel(day: DaySessions): string | null {
  const sessions = [day.morning, day.evening].filter(
    (s): s is SessionWindow => !!s
  );
  if (day.isClosed || sessions.length === 0) return null;

  const start = sessions[0].start;
  const end = sessions[sessions.length - 1].end;
  return `${to12h(start)} – ${to12h(end)}`;
}
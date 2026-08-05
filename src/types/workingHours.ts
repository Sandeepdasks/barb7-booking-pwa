export interface SessionWindow {
  start: string; // "HH:mm" 24h IST
  end: string;   // "HH:mm" 24h IST
}

// SessionKey/DaySessions previously supported "afternoon" as a third bookable
// session. Removed for the real BARB7 schedule: the salon's midday gap
// (2:00 PM–3:30 PM) is a LUNCH BREAK, not a bookable afternoon slot — it's
// simply the space between the morning and evening sessions' end/start
// times, requiring no session entry of its own.
export type SessionKey = "morning" | "evening";

export interface DaySessions {
  morning?: SessionWindow;
  evening?: SessionWindow;
  isClosed: boolean;
}

export type WeekdayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface WorkingHoursConfig {
  // Base grid granularity for the visual slot list (e.g. 30/60 min). This is
  // NOT the appointment duration — that's now dynamic, driven by the selected
  // service(s)' own durationMinutes (see utils/serviceDurationEngine.ts).
  baseSlotIntervalMinutes: number;
  sunday: DaySessions;
  monday: DaySessions;
  tuesday: DaySessions;
  wednesday: DaySessions;
  thursday: DaySessions;
  friday: DaySessions;
  saturday: DaySessions;
}
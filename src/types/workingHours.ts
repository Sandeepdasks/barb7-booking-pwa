export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// Compatibility alias for older/newer generated files
export type WeekdayKey = DayKey;

export type SessionKey = "morning" | "afternoon" | "evening";

export interface SessionWindow {
  start: string;
  end: string;
}

export interface DaySessions {
  morning: SessionWindow;
  afternoon: SessionWindow;
  evening: SessionWindow;
  isClosed: boolean;
}

export type WorkingHoursConfig = Record<DayKey, DaySessions> & {
  baseSlotIntervalMinutes: number;
};
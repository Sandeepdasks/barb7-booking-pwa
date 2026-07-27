export interface DayHours {
  start: string; // HH:mm
  end: string; // HH:mm
  breakStart: string | null;
  breakEnd: string | null;
  closed: boolean;
}

export interface WorkingHours {
  salonId: string;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  slotDurationMins: number;
  updatedAt: number;
}

export type HolidayType = 'recurring' | 'oneoff';

export interface Holiday {
  holidayId: string;
  salonId: string;
  type: HolidayType;
  dayOfWeek?: number; // 0-6, required if recurring
  date?: string; // YYYY-MM-DD, required if oneoff
  label?: string;
  createdAt: number;
}

// Sole source of truth for owner-blocked time — see finalized decision.
export interface BlockedSlot {
  blockId: string;
  salonId: string;
  date: string;
  time: string | null; // null = entire date blocked
  reason?: string;
  createdBy: string; // owner uid
  createdAt: number;
}

export interface SalonSettings {
  salonId: string;
  cancellationWindowMinutes: number; // default 60
  maxBookingDaysAhead: number; // default 2
  updatedAt: number;
}

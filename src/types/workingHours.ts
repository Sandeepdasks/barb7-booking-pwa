export type DayKey =
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
  | 'friday' | 'saturday' | 'sunday';

export interface DayHours {
  openTime: string;   // "09:00" (24h)
  closeTime: string;  // "20:00" (24h)
  isClosed: boolean;
  breakStart?: string | null; // reserved for future phase — unused
  breakEnd?: string | null;   // reserved for future phase — unused
}

export interface WorkingHours {
  salonId: string;
  slotDurationMinutes: number; // salon-level, single value for entire salon
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  updatedAt: string; // ISO timestamp
}
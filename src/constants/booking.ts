export const APPOINTMENT_STATUS = {
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export const BOOKING_SOURCE = {
  ONLINE: 'online',
  WALK_IN: 'walk-in',
  PHONE: 'phone',
  WHATSAPP: 'whatsapp',
  MANUAL: 'manual',
} as const;

export const APPOINTMENT_DURATIONS_MINS = [15, 20, 30, 45, 60] as const;

export const DEFAULT_CANCELLATION_WINDOW_MINUTES = 60;
export const MAX_BOOKING_DAYS_AHEAD = 2;
export const SALON_TIMEZONE = 'Asia/Kolkata';

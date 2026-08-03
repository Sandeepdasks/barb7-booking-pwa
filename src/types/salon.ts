export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayHours {
  openTime: string;   // "09:00" 24h IST
  closeTime: string;  // "21:00" 24h IST
  isClosed: boolean;
  slotDurationMinutes: number;
}

export type WorkingHours = Record<Weekday, DayHours>;

export interface Service {
  id: string;
  name: string;
  icon: string; // lucide icon name
  durationMinutes: number; // owner-configurable — drives dynamic slot blocking
}

export interface SalonProfile {
  salonId: string;
  name: string;
  tagline: string;
  rating: number;
  address: string;
  phone: string;
  services: Service[];
  logoUrl: string;
  coverImageUrl: string;
}
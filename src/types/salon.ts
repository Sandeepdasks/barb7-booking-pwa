export interface SalonInfo {
  salonId: string;
  name: string;
  tagline: string;
  rating: number;
  address: string;
  phone: string;
  about: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  durationMinutes: number;
  icon: string; // placeholder emoji until real icon set
}
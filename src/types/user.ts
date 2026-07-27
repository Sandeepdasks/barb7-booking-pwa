export type UserRole = 'customer' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  salonId?: string; // required for owner/admin, omitted for customers
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  authProviders: string[]; // e.g. ["google.com"], future: "phone"
  createdAt: number;
  lastLogin: number;
}

export interface GuestCustomer {
  guestId: string;
  salonId: string;
  name: string;
  phone: string;
  createdBy: string; // owner uid
  createdAt: number;
}

import type { Timestamp } from 'firebase/firestore';

/**
 * Booking status enum — owner-approved (supersedes older appointments enum).
 * confirmed -> in_progress -> completed
 *          \-> cancelled
 *          \-> no_show
 */
export type BookingStatus =
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type BookingSource = 'online' | 'walk-in' | 'phone' | 'whatsapp' | 'manual';

/**
 * Shape of a doc in the `bookings` collection.
 * ASSUMPTION: field names below are inferred from spec (customer app already
 * writes these on booking creation). Verify against actual `bookings` doc
 * shape in the repo and adjust ownerService.ts mappers if names differ.
 */
export interface Booking {
  id: string;
  salonId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  durationMins: number;
  /** YYYY-MM-DD, IST */
  date: string;
  /** HH:mm, 24h, IST */
  time: string;
  status: BookingStatus;
  bookingSource?: BookingSource;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OwnerService {
  id: string;
  name: string;
  durationMins: number;
}

/** One row in the grouped Today Schedule view. */
export interface ScheduleRow {
  time: string;
  bookings: Booking[];
}

export interface DashboardStats {
  totalToday: number;
  completedToday: number;
  pendingToday: number;
}

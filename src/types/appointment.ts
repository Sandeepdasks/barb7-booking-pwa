// Reflects finalized decisions (post-freeze):
// - "blocked" removed from status enum — blockedSlots is sole source of truth for blocks.
// - customerPhone is a nullable snapshot (Google auth doesn't guarantee phone).
export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type BookingSource = 'online' | 'walk-in' | 'phone' | 'whatsapp' | 'manual';

export interface Appointment {
  appointmentId: string; // deterministic: {salonId}_{date}_{time}
  salonId: string;
  customerId: string | null; // users.uid, null if guest
  guestId: string | null; // guestCustomers.guestId, null if registered customer
  customerName: string; // immutable snapshot
  customerEmail: string; // immutable snapshot
  customerPhone: string | null; // nullable snapshot
  date: string; // YYYY-MM-DD, IST
  time: string; // HH:mm, IST, 24h
  durationMins: number; // snapshotted at creation, immutable
  status: AppointmentStatus;
  bookingSource: BookingSource;
  createdBy: string; // uid of customer or owner
  createdAt: number;
  cancelledAt: number | null;
}

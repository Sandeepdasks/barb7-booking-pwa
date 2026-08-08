import { toIstEpochMs } from "../utils/dateUtils";

export type BookingStatus =
  | "confirmed"
  | "cancelled_by_customer"
  | "cancelled_by_owner"
  | "completed"
  | "blocked"
  | "no_show";

export const CANCELLED_STATUSES: BookingStatus[] = [
  "cancelled_by_customer",
  "cancelled_by_owner",
];

export function isActiveStatus(status: BookingStatus): boolean {
  return status === "confirmed";
}

export interface BookedService {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
}

export interface Booking {
  bookingId: string;

  salonId: string;
  salonName: string;

  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;

  services: BookedService[];

  totalDurationMinutes: number;

  appointmentDate: string;
  appointmentTime: string;
  appointmentEndTime: string;

  status: BookingStatus;

  createdAt: string;
  updatedAt: string;

  cancelledAt?: string | null;
}

export function isUpcomingBooking(
  booking: Booking,
  nowMs: number = Date.now()
): boolean {
  if (!isActiveStatus(booking.status)) {
    return false;
  }

  return (
    toIstEpochMs(
      booking.appointmentDate,
      booking.appointmentEndTime
    ) > nowMs
  );
}
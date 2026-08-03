import { Booking } from "../types/bookingRecord";

// In-memory only — module-level array simulates the future `appointments`
// collection closely enough to swap in a real Firestore query later with
// minimal component changes. Seeded with two demo rows so /my-bookings has
// something to show (Past tab) before any real booking is created.
let bookings: Booking[] = [
  {
    bookingId: "B7-20260728-4471",
    salonId: "barb7-vayanasala",
    salonName: "BARB7 UNISEX SALON",
    customerId: null,
    customerName: "Demo Customer",
    customerEmail: "demo@example.com",
    customerPhone: "9876543210",
    serviceId: "hair-cut",
    serviceName: "Hair Cut",
    appointmentDate: "2026-07-28",
    appointmentTime: "11:00",
    durationMinutes: 60,
    status: "completed",
    createdAt: "2026-07-26T10:00:00.000Z",
  },
  {
    bookingId: "B7-20260725-2210",
    salonId: "barb7-vayanasala",
    salonName: "BARB7 UNISEX SALON",
    customerId: null,
    customerName: "Demo Customer",
    customerEmail: "demo@example.com",
    customerPhone: "9876543210",
    serviceId: "beard-trim",
    serviceName: "Beard Trim",
    appointmentDate: "2026-07-25",
    appointmentTime: "17:00",
    durationMinutes: 60,
    status: "cancelled",
    createdAt: "2026-07-24T09:00:00.000Z",
  },
];

export function getBookings(): Booking[] {
  return bookings;
}

export function addBooking(booking: Booking): void {
  bookings = [booking, ...bookings];
}

export function cancelBooking(bookingId: string): void {
  bookings = bookings.map((b) =>
    b.bookingId === bookingId ? { ...b, status: "cancelled" } : b
  );
}
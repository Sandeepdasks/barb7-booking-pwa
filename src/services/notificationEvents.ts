import { Booking } from "../types/bookingRecord";

// Event architecture per Priority 7. Booking logic emits events; it never
// knows or cares who handles them. To ship real email later, register a
// handler here (or forward these to a Cloud Function / queue) — bookingService
// stays untouched.
export type BookingEvent =
  | { type: "booking.confirmed"; booking: Booking }
  | { type: "booking.cancelled_by_customer"; booking: Booking }
  | { type: "booking.cancelled_by_owner"; booking: Booking };

type BookingEventHandler = (event: BookingEvent) => void | Promise<void>;

const handlers: BookingEventHandler[] = [];

export function onBookingEvent(handler: BookingEventHandler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.indexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

// Fire-and-forget: a failing notification must never roll back or block a
// booking write. Each handler is isolated so one throwing doesn't stop others.
export function emitBookingEvent(event: BookingEvent): void {
  handlers.forEach((handler) => {
    try {
      void Promise.resolve(handler(event)).catch((err) =>
        console.error("Booking event handler failed:", event.type, err)
      );
    } catch (err) {
      console.error("Booking event handler threw:", event.type, err);
    }
  });
}

// --- Default handlers (console stubs) ------------------------------------
// Replace these bodies with real provider calls (see notificationService.ts's
// EmailProvider interface) when email goes live. Recipients noted per spec:
//   customer cancels -> owner is notified
//   owner cancels    -> customer is notified
onBookingEvent((event) => {
  switch (event.type) {
    case "booking.confirmed":
      console.log("[event] confirmation email -> customer", event.booking.bookingId);
      break;
    case "booking.cancelled_by_customer":
      console.log("[event] cancellation notice -> OWNER", event.booking.bookingId);
      break;
    case "booking.cancelled_by_owner":
      console.log("[event] cancellation notice -> CUSTOMER", event.booking.bookingId);
      break;
  }
});
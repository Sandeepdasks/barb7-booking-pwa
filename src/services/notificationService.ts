import { onBookingEvent } from "./notificationEvents";
import { mockSalonProfile } from "./mockSalonService";
import { DEFAULT_CANCELLATION_WINDOW_MINUTES } from "../utils/bounded/cancellationPolicy";
import { BookingConfirmationEmailPayload, EmailProvider } from "../types/notification";
import { formatDisplayDate, formatDisplayTimeRange } from "../utils/dateUtils";

// Mock provider: logs the email instead of sending it. To go live, write a
// new class implementing EmailProvider (e.g. FirebaseFunctionsEmailProvider,
// EmailJSProvider, SendGridProvider, ResendProvider) that calls the real API,
// then swap the `activeProvider` assignment below — nothing else in the app
// (BookingPage, etc.) needs to change, since callers only ever use
// sendBookingConfirmationEmail().
class MockConsoleEmailProvider implements EmailProvider {
  async sendBookingConfirmation(payload: BookingConfirmationEmailPayload): Promise<void> {
    const subject = "BARB7 Appointment Confirmation";
    const body = [
      payload.salonName,
      `Booking ID: ${payload.bookingId}`,
      `Date: ${formatDisplayDate(payload.appointmentDate)}`,
      `Time: ${formatDisplayTimeRange(payload.appointmentTime, payload.appointmentEndTime)}`,
      `Service: ${payload.serviceName}`,
      `Name: ${payload.customerName}`,
      `Phone: ${payload.customerPhone}`,
      `Salon Address: ${payload.salonAddress}`,
      `Contact: ${payload.salonContactNumber}`,
      `Cancellation Policy: ${payload.cancellationPolicy}`,
    ].join("\n");

    console.log(`[mock email] To: ${payload.toEmail}\nSubject: ${subject}\n\n${body}`);
  }
}

const activeProvider: EmailProvider = new MockConsoleEmailProvider();

// Never let an email failure block or roll back a confirmed booking —
// catch and log, don't rethrow.
export async function sendBookingConfirmationEmail(
  payload: BookingConfirmationEmailPayload
): Promise<void> {
  try {
    await activeProvider.sendBookingConfirmation(payload);
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
  }
}

// --- Wire the email provider to the booking event bus ---------------------
// Booking logic emits events (services/notificationEvents.ts); this file is
// the only place that knows how to deliver them. Swap MockConsoleEmailProvider
// above for a real provider and every event below starts sending for real.
onBookingEvent(async (event) => {
  if (event.type !== "booking.confirmed") return;
  const b = event.booking;
  if (!b.customerEmail) return;

  await sendBookingConfirmationEmail({
    toEmail: b.customerEmail,
    salonName: b.salonName,
    bookingId: b.bookingId,
    appointmentDate: b.appointmentDate,
    appointmentTime: b.appointmentTime,
    appointmentEndTime: b.appointmentEndTime,
    serviceName: b.services.map((s) => s.serviceName).join(", "),
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    salonAddress: mockSalonProfile.address,
    salonContactNumber: mockSalonProfile.phone,
    cancellationPolicy: `Free cancellation up to ${
      DEFAULT_CANCELLATION_WINDOW_MINUTES / 60
    } hours before your appointment.`,
  });
});
export interface BookingConfirmationEmailPayload {
  toEmail: string;
  salonName: string;
  bookingId: string;
  appointmentDate: string; // YYYY-MM-DD — presentation formatting happens at send time, not here
  appointmentTime: string; // HH:mm 24h — start
  appointmentEndTime: string; // HH:mm 24h — end
  serviceName: string;
  customerName: string;
  customerPhone: string;
  salonAddress: string;
  salonContactNumber: string;
  cancellationPolicy: string;
}

// Any real backend (Firebase Functions, EmailJS, SendGrid, Resend, ...)
// implements this interface — nothing else in the app depends on which one.
export interface EmailProvider {
  sendBookingConfirmation(payload: BookingConfirmationEmailPayload): Promise<void>;
}
export interface BookingPayload {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // "HH:mm" 24h
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  selectedServices: string[]; // service ids, multi-select
}
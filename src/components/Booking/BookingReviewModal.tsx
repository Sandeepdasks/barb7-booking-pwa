import { X } from "lucide-react";
import { Booking } from "../../types/bookingRecord";

interface BookingReviewModalProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BookingReviewModal({
  open,
  booking,
  onClose,
  onConfirm,
}: BookingReviewModalProps) {
  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#2E313C] p-6 text-[#F5F1EA] shadow-2xl relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#B8BCC8] hover:text-[#F5F1EA]"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold">Confirm Your Booking</h2>

        <div className="mt-6 space-y-4">

          <Row label="Salon" value={booking.salonName} />
          <Row label="Date" value={booking.appointmentDate} />
          <Row label="Time" value={booking.appointmentTime} />
          <Row
  label="Service"
  value={booking.services.map((s) => s.serviceName).join(", ")}
/>
          <Row label="Name" value={booking.customerName} />
          <Row label="Phone" value={booking.customerPhone} />

        </div>

        <button
          onClick={onConfirm}
          className="mt-8 w-full rounded-2xl bg-[#C9A278] py-4 text-sm font-semibold uppercase tracking-wide text-[#1F2128]"
        >
          Confirm Booking
        </button>

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
      <span className="text-sm text-[#B8BCC8]">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
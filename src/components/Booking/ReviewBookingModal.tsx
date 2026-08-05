import { X } from "lucide-react";
import { BookedService } from "../../types/bookingRecord";
import { BookingSummaryCard } from "./BookingSummaryCard";
import { ContactDetailsSubmitPayload } from "./ContactDetailsModal";

interface ReviewBookingModalProps {
  open: boolean;
  salonName: string;
  dateLabel: string; // e.g. "Fri, 31 Jul"
  timeLabel: string; // e.g. "3:30 PM"
  email: string | null;
  services: BookedService[];
  contact: ContactDetailsSubmitPayload | null;
  submitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

// This is the ONLY step that actually creates the booking. The Firestore
// transaction runs behind `onConfirm` — see services/bookingService.ts.
export function ReviewBookingModal({
  open,
  salonName,
  dateLabel,
  timeLabel,
  email,
  services,
  contact,
  submitting,
  errorMessage,
  onClose,
  onConfirm,
}: ReviewBookingModalProps) {
  if (!open || !contact) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-sm animate-[modalIn_180ms_ease-out] flex-col rounded-[24px] bg-[#2E313C] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#1F2128]/60 text-[#B8BCC8] transition hover:text-[#F5F1EA] disabled:opacity-40"
        >
          <X size={16} />
        </button>

        <div className="flex-1 overflow-y-auto px-6 pt-6">
          <h2 className="mb-4 pr-10 text-lg font-bold text-[#F5F1EA]">
            Review Your Booking
          </h2>

          <BookingSummaryCard
            salonName={salonName}
            dateLabel={dateLabel}
            timeLabel={timeLabel}
          />

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[0.75rem] leading-[1.4rem] font-semibold uppercase tracking-wide text-[#B8BCC8]">
                Services
              </p>
              <ul className="flex flex-col gap-1.5">
                {services.map((s) => (
                  <li
                    key={s.serviceId}
                    className="flex justify-between gap-4 text-sm text-[#F5F1EA]"
                  >
                    <span>{s.serviceName}</span>
                    <span className="text-[#B8BCC8]">{s.durationMinutes} min</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-[0.75rem] leading-[1.4rem] font-semibold uppercase tracking-wide text-[#B8BCC8]">
                Customer
              </p>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-[#F5F1EA]">{contact.customerName}</span>
                {email && <span className="text-[#B8BCC8]">{email}</span>}
                <span className="text-[#B8BCC8]">{contact.customerPhone}</span>
              </div>
            </div>

            <p className="text-[0.75rem] leading-[1.4rem] text-[#B8BCC8]">
              Please arrive 10 minutes before your appointment.
            </p>

            {errorMessage && (
              <p className="text-[0.75rem] leading-[1.4rem] leading-relaxed text-red-400">{errorMessage}</p>
            )}
          </div>
        </div>

        <div className="rounded-b-[24px] bg-[#2E313C] px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="w-full rounded-[10px] bg-[#C9A278] py-3 text-sm font-semibold text-[#1F2128] shadow-[0_8px_20px_rgba(201,162,120,0.35)] transition disabled:opacity-60"
          >
            {submitting ? "Confirming…" : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
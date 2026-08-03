import { Booking, BookingStatus } from "../../types/bookingRecord";
import { formatDisplayDate, formatDisplayTimeRange } from "../../utils/dateUtils";
import { getCancellationEligibility } from "../../utils/bounded/cancellationPolicy";

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: "bg-[#C9A278]/15 text-[#C9A278]",
  completed: "bg-[#B8BCC8]/15 text-[#B8BCC8]",
  cancelled_by_customer: "bg-red-400/15 text-red-400",
  cancelled_by_owner: "bg-red-400/15 text-red-400",
  blocked: "bg-red-400/15 text-red-400",
  no_show: "bg-red-400/15 text-red-400",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled_by_customer: "Cancelled",
  cancelled_by_owner: "Cancelled by Salon",
  blocked: "Blocked",
  no_show: "No Show",
};

interface BookingCardProps {
  booking: Booking;
  variant: "upcoming" | "past";
  onCancel?: () => void;
  onBookAgain?: () => void;
}

export function BookingCard({ booking, variant, onCancel, onBookAgain }: BookingCardProps) {
  const serviceNames = booking.services.map((s) => s.serviceName).join(", ");
  const eligibility =
    variant === "upcoming" ? getCancellationEligibility(booking) : { canCancel: false };

  return (
    <div className="rounded-2xl bg-[#2E313C] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#F5F1EA]">{booking.salonName}</p>
          <p className="mt-1 text-xs text-[#B8BCC8]">
            {formatDisplayDate(booking.appointmentDate)} ·{" "}
            {formatDisplayTimeRange(booking.appointmentTime, booking.appointmentEndTime)}
          </p>
          <p className="mt-1 text-xs text-[#B8BCC8]">{serviceNames}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[booking.status]}`}
        >
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {variant === "upcoming" && (
        <div className="mt-3">
          {eligibility.canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-[10px] bg-[#1F2128] py-2 text-xs font-semibold text-[#F5F1EA]"
            >
              Cancel Booking
            </button>
          ) : (
            // Cancellation window has passed — explain rather than silently
            // hiding the action.
            <p className="text-[11px] leading-relaxed text-[#B8BCC8]">
              {eligibility.reason}
            </p>
          )}
        </div>
      )}

      {variant === "past" && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onBookAgain}
            className="w-full rounded-[10px] bg-[#C9A278] py-2 text-xs font-semibold text-[#1F2128]"
          >
            Book Again
          </button>
        </div>
      )}
    </div>
  );
}
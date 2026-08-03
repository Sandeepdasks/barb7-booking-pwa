interface EmptyBookingsStateProps {
  variant: "upcoming" | "past";
  onBookAppointment: () => void;
}

// Inline SVG rather than an asset file — keeps the bundle lean and inherits
// the BARB7 palette directly.
function CalendarIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="14" y="22" width="68" height="60" rx="12" fill="#2E313C" />
      <rect x="14" y="22" width="68" height="16" rx="12" fill="#C9A278" opacity="0.35" />
      <rect x="28" y="14" width="6" height="16" rx="3" fill="#C9A278" />
      <rect x="62" y="14" width="6" height="16" rx="3" fill="#C9A278" />
      <circle cx="34" cy="52" r="4" fill="#C9A278" opacity="0.6" />
      <circle cx="48" cy="52" r="4" fill="#C9A278" opacity="0.35" />
      <circle cx="62" cy="52" r="4" fill="#C9A278" opacity="0.35" />
      <circle cx="34" cy="66" r="4" fill="#C9A278" opacity="0.35" />
      <circle cx="48" cy="66" r="4" fill="#C9A278" opacity="0.35" />
    </svg>
  );
}

export function EmptyBookingsState({ variant, onBookAppointment }: EmptyBookingsStateProps) {
  const isUpcoming = variant === "upcoming";

  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <CalendarIllustration />
      <h3 className="mt-6 text-base font-bold text-[#F5F1EA]">
        {isUpcoming ? "No upcoming appointments" : "No past appointments"}
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#B8BCC8]">
        {isUpcoming
          ? "You haven't booked anything yet. Reserve your next visit to BARB7 in a few taps."
          : "Your completed and cancelled appointments will appear here."}
      </p>
      {isUpcoming && (
        <button
          type="button"
          onClick={onBookAppointment}
          className="mt-6 rounded-[10px] bg-[#C9A278] px-6 py-3 text-sm font-semibold text-[#1F2128] transition active:scale-[0.98]"
        >
          Book Appointment
        </button>
      )}
    </div>
  );
}
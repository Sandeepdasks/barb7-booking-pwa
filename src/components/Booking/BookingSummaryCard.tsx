interface BookingSummaryCardProps {
  salonName: string;
  dateLabel: string;
  timeLabel: string; // start time only, e.g. "7:00 PM" — no range, no duration
}

// Duration/time-range intentionally NOT shown here: actual appointment length
// depends on the selected service(s) (see utils/serviceDurationEngine.ts), so
// a fixed duration/end-time would be misleading before that's picked.
export function BookingSummaryCard({
  salonName,
  dateLabel,
  timeLabel,
}: BookingSummaryCardProps) {
  return (
    <div className="rounded-[20px] border border-[#C9A278]/40 bg-[#1F2128] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <p className="text-sm font-bold text-[#F5F1EA]">{salonName}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#B8BCC8]">
            Date
          </p>
          <p className="mt-0.5 text-[0.75rem] leading-[1.4rem] font-semibold text-[#F5F1EA]">{dateLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#B8BCC8]">
            Time
          </p>
          <p className="mt-0.5 text-[0.75rem] leading-[1.4rem] font-semibold text-[#F5F1EA]">{timeLabel || "—"}</p>
        </div>
      </div>
    </div>
  );
}
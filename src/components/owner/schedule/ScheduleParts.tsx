// Date navigator for /owner/schedule. The card-stack event renderers that used to live in this
// file (BookingCard, BlockedSlotCard, LunchBreakBanner, TimelineList) were superseded by the
// Google-Calendar-style grid in CalendarTimeline.tsx (2026-08-08) and removed here rather than
// left as dead code importing a type that no longer exists — avoids a second, parallel schedule
// rendering path.

export function DateNavigator({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous day"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2B3240] text-[#A7AAB4] active:bg-[#1C2230]"
      >
        ‹
      </button>
      <span className="text-[15px] font-medium text-[#F5F5F5]">{label}</span>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next day"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2B3240] text-[#A7AAB4] active:bg-[#1C2230]"
      >
        ›
      </button>
    </div>
  );
}

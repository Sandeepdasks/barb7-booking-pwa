// Mirrors BookingTabs + BookingCard dimensions exactly so swapping skeleton
// for real content causes no layout shift.
export function BookingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading bookings">
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Tabs skeleton */}
      <div className="flex gap-2 py-4">
        <div className="h-[42px] flex-1 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-[#2E313C]" />
        <div className="h-[42px] flex-1 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-[#2E313C]" />
      </div>

      {/* Card skeletons */}
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 120}ms` }}
            className="animate-[shimmer_1.4s_ease-in-out_infinite] rounded-2xl bg-[#2E313C] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="h-4 w-2/5 rounded bg-[#1F2128]" />
                <div className="mt-2 h-3 w-3/5 rounded bg-[#1F2128]" />
                <div className="mt-2 h-3 w-1/3 rounded bg-[#1F2128]" />
              </div>
              <div className="h-5 w-20 rounded-full bg-[#1F2128]" />
            </div>
            <div className="mt-3 h-[34px] w-full rounded-[10px] bg-[#1F2128]" />
          </div>
        ))}
      </div>
    </div>
  );
}
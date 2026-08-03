import { BookableDay, BookableDayKey } from "../../utils/dateUtils";

interface DateTabsProps {
  days: BookableDay[];
  activeKey: BookableDayKey;
  onChange: (key: BookableDayKey) => void;
}

// BookMyShow-style vertical date cards: weekday / date number / month.
// No "Today"/"Tomorrow"/"Day After" text anywhere by design.
export function DateTabs({ days, activeKey, onChange }: DateTabsProps) {
  return (
    <div className="flex gap-2.5 py-4 md:gap-4">
      {days.map((day) => {
        const isActive = day.key === activeKey;
        return (
          <button
            key={day.key}
            type="button"
            onClick={() => onChange(day.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-3 transition ${
              isActive
                ? "scale-[1.04] bg-[#C9A278] text-[#1F2128] shadow-[0_10px_24px_rgba(201,162,120,0.35)]"
                : "bg-[#2E313C] text-[#F5F1EA]"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
              {day.weekdayShort}
            </span>
            <span className="text-2xl font-bold leading-none">{day.dayNum}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
              {day.monthShort}
            </span>
          </button>
        );
      })}
    </div>
  );
}
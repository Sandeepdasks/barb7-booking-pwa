import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { BottomSheet } from '@/components/owner/ui/BottomSheet';
import { formatDateReadable } from '@/utils/scheduleTimeline';

// Custom calendar rather than the native date input (too small to tap comfortably on mobile —
// see spec §12) and rather than a new calendar package: this is plain React + Tailwind, zero
// new dependencies, reusing the existing BottomSheet primitive so it inherits the same
// viewport-safe, backdrop-dismiss behaviour already used elsewhere in the owner app.

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABEL_FMT = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

function MonthGrid({
  year,
  month,
  selectedDate,
  minDate,
  onSelect,
}: {
  year: number;
  month: number;
  selectedDate: string;
  minDate: string;
  onSelect: (date: string) => void;
}) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  return (
    <div className="grid grid-cols-7 gap-y-1.5">
      {WEEKDAY_LABELS.map((w, i) => (
        <div key={i} className="flex h-8 items-center justify-center text-[11px] font-medium text-[#6E7482]">
          {w}
        </div>
      ))}
      {cells.map((day, i) => {
        if (day === null) return <div key={`empty-${i}`} />;
        const dateKey = toDateKey(year, month, day);
        const isSelected = dateKey === selectedDate;
        const isPast = dateKey < minDate;
        const isToday = dateKey === new Date().toISOString().slice(0, 10);

        return (
          <button
            key={dateKey}
            type="button"
            disabled={isPast}
            onClick={() => onSelect(dateKey)}
            className={[
              'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[14px] transition-colors duration-150',
              isPast ? 'cursor-not-allowed text-[#3A4150]' : 'text-[#F5F5F5] active:bg-[#2B3240]',
              isSelected ? 'bg-[#C8A06B] font-semibold text-[#0B0D12]' : '',
              isToday && !isSelected ? 'border border-[#C8A06B]/60' : '',
            ].join(' ')}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}

export function DatePickerField({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (date: string) => void;
  minDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(`${value}T00:00:00`);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  function openPicker() {
    const d = new Date(`${value}T00:00:00`);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setOpen(true);
  }

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-[#2B3240] bg-[#1C2230] px-3 text-left text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
      >
        <span>{formatDateReadable(value)}</span>
        <CalendarDays size={18} strokeWidth={2} className="shrink-0 text-[#F5F5F5]" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Select Date">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A7AAB4] active:bg-[#1C2230]"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[15px] font-semibold text-[#F5F5F5]">
            {MONTH_LABEL_FMT.format(new Date(cursor.year, cursor.month, 1))}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A7AAB4] active:bg-[#1C2230]"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mt-4">
          <MonthGrid
            year={cursor.year}
            month={cursor.month}
            selectedDate={value}
            minDate={minDate}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </div>
      </BottomSheet>
    </>
  );
}

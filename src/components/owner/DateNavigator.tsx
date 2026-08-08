import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavigatorProps {
  heading: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isToday: boolean;
}

export const DateNavigator: FC<DateNavigatorProps> = ({
  heading,
  onPrev,
  onNext,
  onToday,
  isToday,
}) => (
  <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/5 bg-[#2E313C] p-3">
    <button
      type="button"
      onClick={onPrev}
      aria-label="Previous day"
      className="rounded-lg p-2 text-[#B8BCC8] active:bg-white/5"
    >
      <ChevronLeft size={20} />
    </button>

    <div className="flex flex-col items-center">
      <span className="text-sm font-semibold text-[#F5F1EA]">{heading}</span>
      {!isToday && (
        <button
          type="button"
          onClick={onToday}
          className="mt-0.5 text-xs font-medium text-[#C9A278] underline underline-offset-2"
        >
          Jump to today
        </button>
      )}
    </div>

    <button
      type="button"
      onClick={onNext}
      aria-label="Next day"
      className="rounded-lg p-2 text-[#B8BCC8] active:bg-white/5"
    >
      <ChevronRight size={20} />
    </button>
  </div>
);

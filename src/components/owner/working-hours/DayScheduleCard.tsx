import { Switch } from '@headlessui/react';
import type { DayKey, DaySchedule } from '../../../types/workingHours.types';
import { DAY_LABELS } from '../../../constants/workingHours.constants';

interface DayScheduleCardProps {
  dayKey: DayKey;
  schedule: DaySchedule;
  error?: string;
  onChange: (dayKey: DayKey, schedule: DaySchedule) => void;
}

// requires: npm install @headlessui/react (if not already a dependency)
export function DayScheduleCard({ dayKey, schedule, error, onChange }: DayScheduleCardProps) {
  const isOpen = !schedule.isClosed;

  const toggleOpen = (open: boolean) => {
    onChange(dayKey, { ...schedule, isClosed: !open });
  };

  const setOpenTime = (openTime: string) => {
    onChange(dayKey, { ...schedule, openTime });
  };

  const setCloseTime = (closeTime: string) => {
    onChange(dayKey, { ...schedule, closeTime });
  };

  return (
    <div className="rounded-xl border border-[#2B3240] bg-[#151922] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[#F5F5F5]">{DAY_LABELS[dayKey]}</span>

        <Switch
          checked={isOpen}
          onChange={toggleOpen}
          className={`${isOpen ? 'bg-[#C8A06B]' : 'bg-[#2B3240]'}
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
            rounded-full transition-colors duration-200 ease-in-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A06B]
            focus-visible:ring-offset-2 focus-visible:ring-offset-[#151922]`}
        >
          <span className="sr-only">{DAY_LABELS[dayKey]} open</span>
          <span
            aria-hidden="true"
            className={`${isOpen ? 'translate-x-5' : 'translate-x-0.5'}
              pointer-events-none inline-block h-5 w-5 transform rounded-full
              bg-white shadow transition-transform duration-200 ease-in-out`}
          />
        </Switch>
      </div>

      {schedule.isClosed ? (
        <p className="text-sm text-[#6E7482]">Closed</p>
      ) : (
        <div className="flex items-center gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs text-[#A7AAB4]">
            Open
            <input
              type="time"
              value={schedule.openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="rounded-md border border-[#2B3240] bg-[#1C2230] px-2 py-1.5 text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
            />
          </label>
          <span className="pt-4 text-[#6E7482]">–</span>
          <label className="flex flex-1 flex-col gap-1 text-xs text-[#A7AAB4]">
            Close
            <input
              type="time"
              value={schedule.closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="rounded-md border border-[#2B3240] bg-[#1C2230] px-2 py-1.5 text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
            />
          </label>
        </div>
      )}

      {error && <p className="text-xs text-[#E5484D]">{error}</p>}
    </div>
  );
}

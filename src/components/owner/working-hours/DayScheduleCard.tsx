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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-zinc-100">{DAY_LABELS[dayKey]}</span>

        <Switch
          checked={isOpen}
          onChange={toggleOpen}
          className={`${isOpen ? 'bg-[#C9A278]' : 'bg-zinc-700'}
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
            rounded-full transition-colors duration-200 ease-in-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A278]
            focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900`}
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
        <p className="text-sm text-zinc-500">Closed</p>
      ) : (
        <div className="flex items-center gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
            Open
            <input
              type="time"
              value={schedule.openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
            />
          </label>
          <span className="pt-4 text-zinc-600">–</span>
          <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
            Close
            <input
              type="time"
              value={schedule.closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
            />
          </label>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

import type { LunchBreak } from '../../../types/workingHours.types';

interface LunchBreakEditorProps {
  lunchBreak: LunchBreak;
  error?: string;
  onChange: (lunchBreak: LunchBreak) => void;
}

export function LunchBreakEditor({ lunchBreak, error, onChange }: LunchBreakEditorProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <span className="font-medium text-zinc-100">Lunch break</span>
      <div className="flex items-center gap-3">
        <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
          Start
          <input
            type="time"
            value={lunchBreak.start}
            onChange={(e) => onChange({ ...lunchBreak, start: e.target.value })}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
          />
        </label>
        <span className="pt-4 text-zinc-600">–</span>
        <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
          End
          <input
            type="time"
            value={lunchBreak.end}
            onChange={(e) => onChange({ ...lunchBreak, end: e.target.value })}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

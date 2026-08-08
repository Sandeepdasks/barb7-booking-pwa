import type { LunchBreak } from '../../../types/workingHours.types';

interface LunchBreakEditorProps {
  lunchBreak: LunchBreak;
  error?: string;
  onChange: (lunchBreak: LunchBreak) => void;
}

export function LunchBreakEditor({ lunchBreak, error, onChange }: LunchBreakEditorProps) {
  return (
    <div className="rounded-xl border border-[#2B3240] bg-[#151922] p-4 space-y-3">
      <span className="font-medium text-[#F5F5F5]">Lunch break</span>
      <div className="flex items-center gap-3">
        <label className="flex flex-1 flex-col gap-1 text-xs text-[#A7AAB4]">
          Start
          <input
            type="time"
            value={lunchBreak.start}
            onChange={(e) => onChange({ ...lunchBreak, start: e.target.value })}
            style={{ colorScheme: 'dark' }}
            className="rounded-md border border-[#2B3240] bg-[#1C2230] px-2 py-1.5 text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
          />
        </label>
        <span className="pt-4 text-[#6E7482]">–</span>
        <label className="flex flex-1 flex-col gap-1 text-xs text-[#A7AAB4]">
          End
          <input
            type="time"
            value={lunchBreak.end}
            onChange={(e) => onChange({ ...lunchBreak, end: e.target.value })}
            style={{ colorScheme: 'dark' }}
            className="rounded-md border border-[#2B3240] bg-[#1C2230] px-2 py-1.5 text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
          />
        </label>
      </div>
      {error && <p className="text-xs text-[#E5484D]">{error}</p>}
    </div>
  );
}

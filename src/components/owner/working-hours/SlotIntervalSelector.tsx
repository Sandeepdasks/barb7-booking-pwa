import { SLOT_INTERVAL_OPTIONS } from '../../../constants/workingHours.constants';
import type { SlotIntervalMinutes } from '../../../types/workingHours.types';

interface SlotIntervalSelectorProps {
  value: SlotIntervalMinutes;
  error?: string;
  onChange: (value: SlotIntervalMinutes) => void;
}

export function SlotIntervalSelector({ value, error, onChange }: SlotIntervalSelectorProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <span className="font-medium text-zinc-100">Slot interval</span>
      <div className="grid grid-cols-4 gap-2">
        {SLOT_INTERVAL_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              value === opt
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {opt}m
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

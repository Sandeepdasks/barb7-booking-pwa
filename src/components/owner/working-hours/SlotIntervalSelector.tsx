import { SLOT_INTERVAL_OPTIONS } from '../../../constants/workingHours.constants';
import type { SlotIntervalMinutes } from '../../../types/workingHours.types';

interface SlotIntervalSelectorProps {
  value: SlotIntervalMinutes;
  error?: string;
  onChange: (value: SlotIntervalMinutes) => void;
}

export function SlotIntervalSelector({ value, error, onChange }: SlotIntervalSelectorProps) {
  return (
    <div className="rounded-xl border border-[#2B3240] bg-[#151922] p-4 space-y-3">
      <span className="font-medium text-[#F5F5F5]">Slot interval</span>
      <div className="grid grid-cols-4 gap-2">
        {SLOT_INTERVAL_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              value === opt
                ? 'bg-[#C8A06B] text-[#0B0D12]'
                : 'bg-[#1C2230] text-[#A7AAB4] hover:bg-[#2B3240]'
            }`}
          >
            {opt}m
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-[#E5484D]">{error}</p>}
    </div>
  );
}

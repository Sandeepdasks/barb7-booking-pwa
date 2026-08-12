import { TimeSlot } from '../../utils/slotUtils';
import { formatTime12h } from '../../utils/workingHoursUtils';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function SlotGrid({ slots, selectedTime, onSelect }: SlotGridProps) {
  if (slots.length === 0) {
    return <p className="text-[#8B8F9C] text-sm text-center py-8">No slots available for this date.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = slot.time === selectedTime;
        return (
          <button
            key={slot.time}
            disabled={slot.isBooked}
            onClick={() => onSelect(slot.time)}
            className={`rounded-full py-2 text-sm font-mono transition-colors ${
              slot.isBooked
                ? 'bg-[#2E313C] text-[#54586A] line-through cursor-not-allowed'
                : isSelected
                ? 'bg-[#C9A278] text-[#1F2128] font-semibold'
                : 'bg-[#3A3E4A] text-[#F5F1EA] hover:bg-[#4A4E5C]'
            }`}
          >
            {formatTime12h(slot.time)}
          </button>
        );
      })}
    </div>
  );
}
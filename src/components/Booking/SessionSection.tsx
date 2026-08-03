import { TimeSlotChip } from "./TimeSlotChip";
import { AvailabilitySlot, isSlotSelectable } from "../../utils/bookingAvailability";
import { to12h } from "../../utils/slotGenerator";

interface SessionSectionProps {
  title: string;
  slots: AvailabilitySlot[];
  selectedTime: string | undefined;
  onSelect: (time24: string) => void;
}

export function SessionSection({
  title,
  slots,
  selectedTime,
  onSelect,
}: SessionSectionProps) {
  if (slots.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold tracking-tight text-[#B8BCC8]">
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-2.5 md:gap-4">
        {slots.map((slot) => {
          const selectable = isSlotSelectable(slot);
          return (
            <TimeSlotChip
              key={slot.time24}
              label={to12h(slot.time24)}
              // Only "Booked" is worth surfacing; past/overflow slots read as
              // plainly unavailable without needing a reason label.
              sublabel={slot.isBooked && !slot.isPast ? "Booked" : undefined}
              state={
                !selectable
                  ? "unavailable"
                  : selectedTime === slot.time24
                  ? "selected"
                  : "available"
              }
              onClick={() => selectable && onSelect(slot.time24)}
            />
          );
        })}
      </div>
    </div>
  );
}
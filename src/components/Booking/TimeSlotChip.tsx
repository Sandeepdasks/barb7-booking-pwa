export type SlotState = "available" | "selected" | "unavailable";

interface TimeSlotChipProps {
  label: string; // e.g. "09:00 AM"
  state: SlotState;
  sublabel?: string; // e.g. "Booked" — shown for already-reserved slots
  onClick: () => void;
}

const STATE_STYLES: Record<SlotState, string> = {
  available:
    "bg-[#2E313C] text-[#F5F1EA] border border-[#F5F1EA]/10 active:scale-[0.97]",
  selected:
    "bg-[#C9A278] text-[#1F2128] font-semibold scale-[1.03] shadow-[0_6px_16px_rgba(201,162,120,0.35)]",
  unavailable: "bg-[#2E313C]/40 text-[#B8BCC8]/40 cursor-not-allowed",
};

export function TimeSlotChip({ label, state, sublabel, onClick }: TimeSlotChipProps) {
  return (
    <button
      type="button"
      disabled={state === "unavailable"}
      onClick={onClick}
      className={`rounded-lg py-2.5 text-center text-[13px] font-medium leading-tight transition ${STATE_STYLES[state]}`}
    >
      {label}
      {sublabel && (
        <span className="mt-0.5 block text-[9px] font-normal uppercase tracking-wide">
          {sublabel}
        </span>
      )}
    </button>
  );
}
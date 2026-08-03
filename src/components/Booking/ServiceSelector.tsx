import { Service } from "../../types/salon";

interface ServiceSelectorProps {
  services: Service[];
  selectedIds: string[];
  totalDurationMinutes: number;
  onToggle: (serviceId: string) => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

// Step 2 of the booking flow (after date, before time). Durations come from
// the Service model, so once the owner app can edit them this reflows with no
// component changes.
export function ServiceSelector({
  services,
  selectedIds,
  totalDurationMinutes,
  onToggle,
}: ServiceSelectorProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-[#B8BCC8]">
          Select Services
        </h3>
        {totalDurationMinutes > 0 && (
          <span className="text-xs font-medium text-[#C9A278]">
            {formatDuration(totalDurationMinutes)} total
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:gap-4">
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onToggle(service.id)}
              className={`flex flex-col items-start gap-0.5 rounded-[10px] px-3 py-2.5 text-left transition ${
                selected
                  ? "bg-[#C9A278] text-[#1F2128]"
                  : "border border-[#F5F1EA]/10 bg-[#2E313C] text-[#F5F1EA] active:scale-[0.98]"
              }`}
            >
              <span className="text-[13px] font-medium">{service.name}</span>
              <span
                className={`text-[11px] ${
                  selected ? "text-[#1F2128]/70" : "text-[#B8BCC8]"
                }`}
              >
                {formatDuration(service.durationMinutes)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
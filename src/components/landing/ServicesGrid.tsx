import { Scissors, Zap, Droplet, Palette, Sparkles, Sun, Crown, type LucideIcon } from "lucide-react";
import { Service } from "../../types/salon";

const ICON_MAP: Record<string, LucideIcon> = {
  Scissors,
  Zap,
  Droplet,
  Palette,
  Sparkles,
  Sun,
  Crown,
};

interface ServicesGridProps {
  services: Service[];
}

// Informational list, not a set of tappable cards: no background, no shadow,
// no elevation, no hover/cursor affordance — icon + name only.
export function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <section className="pb-8">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-[#F5F1EA]">
        Services
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {services.map((service) => {
          const Icon = ICON_MAP[service.icon] ?? Sparkles;
          return (
            <div
              key={service.id}
              className="flex cursor-default select-none items-center gap-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A278]/15">
                <Icon size={18} className="text-[#C9A278]" />
              </span>
              <span className="text-sm font-medium text-[#F5F1EA]">
                {service.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
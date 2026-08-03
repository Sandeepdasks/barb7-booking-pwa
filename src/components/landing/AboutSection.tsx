import { Clock } from "lucide-react";
import { SalonProfile } from "../../types/salon";
import { TodayStatus } from "../../hooks/useWorkingHours";

interface AboutSectionProps {
  salon: SalonProfile;
  status: TodayStatus;
}

export function AboutSection({ salon, status }: AboutSectionProps) {
  return (
    <section className="py-8">
      <h2 className="text-lg font-semibold tracking-tight text-[#F5F1EA]">
        About {salon.name.split(" ")[0]}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[#B8BCC8]">
        A modern hair, skin and makeup studio in the heart of Kochi —
        precision cuts, relaxed grooming, and a space built to feel like a
        break, not an errand.
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#2E313C] px-4 py-3">
        <Clock size={16} className="shrink-0 text-[#C9A278]" />
        <span className="text-sm font-medium text-[#F5F1EA]">
          Today · {status.displayHours}
        </span>
      </div>
    </section>
  );
}
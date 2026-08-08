import { SalonProfile } from "../../types/salon";


interface AboutSectionProps {
  salon: SalonProfile;
  
}

export function AboutSection({ salon }: AboutSectionProps) {
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

    </section>
  );
}
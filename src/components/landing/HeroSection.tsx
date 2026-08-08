import { Star, MapPin, Phone, LogOut } from "lucide-react";
import { SalonProfile } from "../../types/salon";
import { ResponsiveContainer } from "../layout/ResponsiveContainer";

interface HeroSectionProps {
  salon: SalonProfile;
  isAuthenticated: boolean;
  onLogout: () => void;
}

// Hero content shares ResponsiveContainer's max-width/padding so it lines up
// with About/Services on md/lg/xl — the cover image itself stays full-bleed,
// only the overlay content is aligned.
export function HeroSection({
  salon,
  isAuthenticated,
  onLogout,
}: HeroSectionProps) {
  return (
    <section className="relative h-[32vh] min-h-[260px] w-full overflow-hidden">
      <img
        src={salon.coverImageUrl}
        alt={`${salon.name} interior`}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Cinematic dark gradient so overlay text stays legible on any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1F2128] via-[#1F2128]/70 to-[#1F2128]/10" />

      <ResponsiveContainer className="absolute inset-0 flex h-full flex-col justify-between py-4">
        {/* Top-right slot: Logout icon for signed-in users only */}
        <div className="flex justify-end">
          {isAuthenticated && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              className="flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-[10px] bg-[#1F2128]/70 text-[#F5F1EA] shadow-lg backdrop-blur-md transition hover:bg-[#1F2128] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A278]"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Hero content */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold leading-tight text-[#F5F1EA]">
            {salon.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] leading-[1.4rem] text-[#F5F1EA]/90">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1F2128]/60 px-2 py-1 backdrop-blur-sm">
              <Star size={12} className="fill-[#C9A278] text-[#C9A278]" />
              {salon.rating.toFixed(1)}
            </span>

            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {salon.address}
            </span>

            <span className="inline-flex items-center gap-1">
              <Phone size={12} />
              {salon.phone}
            </span>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
}
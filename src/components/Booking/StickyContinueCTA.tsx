import { ResponsiveContainer } from "../layout/ResponsiveContainer";

interface StickyContinueCTAProps {
  enabled: boolean;
  loading?: boolean;
  onContinue: () => void;
}

export function StickyContinueCTA({
  enabled,
  loading = false,
  onContinue,
}: StickyContinueCTAProps) {
  const clickable = enabled && !loading;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#1F2128] via-[#1F2128]/95 to-transparent pb-4 pt-6">
      <ResponsiveContainer>
        <button
          type="button"
          disabled={!clickable}
          onClick={onContinue}
          className={`w-full rounded-[10px] py-3.5 text-[15px] font-semibold transition ${
            clickable
              ? "bg-[#C9A278] text-[#1F2128] shadow-[0_8px_24px_rgba(201,162,120,0.35)] active:scale-[0.98]"
              : "bg-[#2E313C] text-[#B8BCC8]/50 cursor-not-allowed"
          }`}
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </ResponsiveContainer>
    </div>
  );
}
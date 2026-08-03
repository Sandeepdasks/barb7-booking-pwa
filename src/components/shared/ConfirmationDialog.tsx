interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  secondaryLabel: string; // dismiss / "no" action
  primaryLabel: string; // confirm / "yes" action — gold
  onSecondary: () => void;
  onPrimary: () => void;
}

// Shared shell for every yes/no confirmation popup in the app (Cancel
// Booking, Logout, ...). Same dark card, corner radius, backdrop blur,
// spacing, typography, and fade+scale animation everywhere — only the copy
// and callbacks differ per use site.
export function ConfirmationDialog({
  open,
  title,
  message,
  secondaryLabel,
  primaryLabel,
  onSecondary,
  onPrimary,
}: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-[modalIn_180ms_ease-out] rounded-[24px] bg-[#2E313C] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <h3 className="text-lg font-bold text-[#F5F1EA]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#B8BCC8]">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onSecondary}
            className="flex-1 whitespace-nowrap rounded-[10px] bg-[#1F2128] py-3 text-sm font-semibold text-[#F5F1EA]"
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            className="flex-1 whitespace-nowrap rounded-[10px] bg-[#C9A278] py-3 text-sm font-semibold text-[#1F2128]"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  open: boolean;
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ open, message, onDismiss, durationMs = 3200 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [open, durationMs, onDismiss]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="flex animate-[toastIn_200ms_ease-out] items-center gap-2.5 rounded-[10px] border border-[#F5F1EA]/10 bg-[#2E313C] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <CheckCircle2 size={16} className="shrink-0 text-[#C9A278]" />
        <span className="text-sm text-[#F5F1EA]">{message}</span>
      </div>
    </div>
  );
}
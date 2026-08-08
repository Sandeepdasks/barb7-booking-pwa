import type { ReactNode } from 'react';

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex w-full max-w-md flex-col rounded-t-[24px] border-t border-[#2B3240] bg-[#151922]"
        style={{ height: '65vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-[#2B3240]" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">{children}</div>
      </div>
    </div>
  );
}

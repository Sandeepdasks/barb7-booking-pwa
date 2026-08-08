import type { ReactNode } from 'react';
import { OwnerButton } from '@/components/owner/ui';

export function ConfirmModal({
  open,
  icon,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Keep Booking',
  onConfirm,
  onCancel,
  confirming,
}: {
  open: boolean;
  icon?: ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-[20px] border border-[#2B3240] bg-[#151922] p-6 text-center"
      >
        {icon && (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5B942]/15 text-[#F5B942]">
            {icon}
          </div>
        )}
        <h3 className="text-[17px] font-semibold text-[#F5F5F5]">{title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[#A7AAB4]">{body}</p>

        <div className="mt-6 flex flex-col gap-3">
          <OwnerButton variant="danger" fullWidth loading={confirming} onClick={onConfirm}>
            {confirmLabel}
          </OwnerButton>
          <OwnerButton variant="secondary" fullWidth onClick={onCancel}>
            {cancelLabel}
          </OwnerButton>
        </div>
      </div>
    </div>
  );
}

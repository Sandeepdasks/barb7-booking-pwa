import { ConfirmModal } from '@/components/owner/ui/ConfirmModal';

export function CancelBlockModal({
  open,
  onConfirm,
  onCancel,
  confirming,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
}) {
  return (
    <ConfirmModal
      open={open}
      icon={<span>⚠️</span>}
      title="Cancel & Block Slot?"
      body="This booking will be cancelled and the time slot will be blocked. Customers will not be able to book this slot until you release it. You can contact the customer directly to inform them."
      confirmLabel="Cancel & Block Slot"
      cancelLabel="Keep Booking"
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirming={confirming}
    />
  );
}

import { ConfirmationDialog } from "../shared/ConfirmationDialog";

interface CancelBookingDialogProps {
  open: boolean;
  onKeepBooking: () => void;
  onConfirmCancel: () => void;
}

export function CancelBookingDialog({
  open,
  onKeepBooking,
  onConfirmCancel,
}: CancelBookingDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Cancel Booking?"
      message="Are you sure you want to cancel your appointment? This action cannot be undone."
      secondaryLabel="Keep Booking"
      primaryLabel="Cancel Booking"
      onSecondary={onKeepBooking}
      onPrimary={onConfirmCancel}
    />
  );
}
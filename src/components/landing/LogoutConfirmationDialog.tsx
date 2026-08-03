import { ConfirmationDialog } from "../shared/ConfirmationDialog";

interface LogoutConfirmationDialogProps {
  open: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function LogoutConfirmationDialog({
  open,
  onStayLoggedIn,
  onLogout,
}: LogoutConfirmationDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Logout?"
      message="Are you sure you want to log out from your account?"
      secondaryLabel="Stay Logged In"
      primaryLabel="Logout"
      onSecondary={onStayLoggedIn}
      onPrimary={onLogout}
    />
  );
}
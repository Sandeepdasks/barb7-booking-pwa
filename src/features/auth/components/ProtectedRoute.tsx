import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowed?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowed = [],
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role check (for future owner/admin support)
  if (allowed.length > 0 && !allowed.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
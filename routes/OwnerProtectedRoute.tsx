import { Navigate } from "react-router-dom";
import { useOwnerAuth } from "../src/contexts/OwnerAuthContext";

export function OwnerProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ownerProfile, loading } = useOwnerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!ownerProfile) {
    return <Navigate to="/owner.html" replace />;
  }

  return <>{children}</>;
}
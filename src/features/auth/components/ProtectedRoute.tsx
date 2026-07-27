import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useRequireRole } from '@/features/auth/hooks/useRequireRole';
import type { UserRole } from '@/types/user';

interface Props {
  allowed: UserRole[];
  redirectTo: string;
  children: ReactNode;
}

export function ProtectedRoute({ allowed, redirectTo, children }: Props) {
  const { authorized, loading } = useRequireRole(allowed);

  if (loading) return <div className="text-center mt-16">Loading…</div>;
  if (!authorized) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}

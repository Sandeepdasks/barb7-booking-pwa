import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/user';

/**
 * Returns whether the current session satisfies one of the allowed roles,
 * plus loading state. Route-level redirect is handled by the caller
 * (ProtectedRoute component) — this hook only reports status.
 */
export function useRequireRole(allowed: UserRole[]) {
  const { user, loading } = useAuth();
  const authorized = !loading && !!user && allowed.includes(user.role);
  return { authorized, loading, user };
}

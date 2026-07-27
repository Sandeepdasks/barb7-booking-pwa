import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import type { UserProfile } from '@/types/user';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Starts true — first onAuthStateChanged callback (session restore on
  // refresh) must resolve before we know if there's a logged-in user.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((_fbUser, profile) => {
      setUser(profile);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const profile = await authService.signInWithGoogle();
      setUser(profile);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithEmailPassword(email: string, password: string) {
    setError(null);
    setLoading(true);
    try {
      const profile = await authService.signInWithEmailPassword(email, password);
      if (!profile) {
        setError('Signed in, but no matching account profile was found.');
        setUser(null);
      } else {
        setUser(profile);
      }
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function signOutUser() {
    setError(null);
    try {
      await authService.signOutUser();
      setUser(null);
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signInWithGoogle, signInWithEmailPassword, signOutUser, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function toErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

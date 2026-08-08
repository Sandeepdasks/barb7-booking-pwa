import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loadOwnerProfile, signInOwnerWithGoogle, signOutOwner, OwnerAuthError } from '@/lib/ownerAuth';
import type { OwnerProfile } from '@/types/owner';
import { OWNER_EMAIL } from '@/constants/owner';

interface OwnerAuthState {
  ownerProfile: OwnerProfile | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const OwnerAuthContext = createContext<OwnerAuthState | null>(null);

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setLoading(true);

    // Nobody signed in → show owner login
    if (!user) {
      setOwnerProfile(null);
      setLoading(false);
      return;
    }

    // A Firebase user is signed in, but it is NOT the authorised owner.
    if (user.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      setOwnerProfile(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await loadOwnerProfile(user);
      setOwnerProfile(profile);
    } catch (err) {
      console.error('Failed to load owner profile:', err);
      setOwnerProfile(null);
    } finally {
      setLoading(false);
    }
  });

  return unsubscribe;
}, []);

  async function signIn() {
    setError(null);
    try {
      const profile = await signInOwnerWithGoogle();
      setOwnerProfile(profile);
    } catch (err) {
      setOwnerProfile(null);
      setError(
        err instanceof OwnerAuthError
          ? err.message
          : 'Sign-in failed. Please try again.'
      );
      throw err;
    }
  }

  async function signOut() {
    await signOutOwner();
    setOwnerProfile(null);
  }

  return (
    <OwnerAuthContext.Provider value={{ ownerProfile, loading, error, signIn, signOut }}>
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth(): OwnerAuthState {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) throw new Error('useOwnerAuth must be used within OwnerAuthProvider');
  return ctx;
}

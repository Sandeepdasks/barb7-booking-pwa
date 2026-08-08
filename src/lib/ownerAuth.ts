import { OWNER_EMAIL } from '../constants/owner';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';

import {
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import type { OwnerProfile } from '@/types/owner';

export class OwnerAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OwnerAuthError';
  }
}

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export async function signInOwnerWithGoogle(): Promise<OwnerProfile> {
  const result = await signInWithPopup(
    auth,
    googleProvider
  );

  const user = result.user;

  const signedInEmail =
    user.email?.trim().toLowerCase();

  const allowedEmail =
    OWNER_EMAIL.trim().toLowerCase();

  // Only the configured owner Google account is allowed.
  if (!signedInEmail || signedInEmail !== allowedEmail) {
    await firebaseSignOut(auth);

    throw new OwnerAuthError(
      'This Google account is not authorized to access the BARB7 Owner Dashboard.'
    );
  }

  const profile = await loadOwnerProfile(user);

  if (!profile) {
    await firebaseSignOut(auth);

    throw new OwnerAuthError(
      'Owner profile not found. Please contact the administrator.'
    );
  }

  // Record Google as an authentication provider if missing.
  if (!profile.authProviders.includes('google.com')) {
    await updateDoc(
      doc(db, 'users', user.uid),
      {
        authProviders: arrayUnion('google.com'),
      }
    );

    profile.authProviders = [
      ...profile.authProviders,
      'google.com',
    ];
  }

  return profile;
}

export async function loadOwnerProfile(
  user: User
): Promise<OwnerProfile | null> {
  try {
    const userRef = doc(
      db,
      'users',
      user.uid
    );

    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      console.warn(
        'Owner Firestore profile does not exist:',
        user.uid
      );

      return null;
    }

    const data = snap.data();

    if (data.role !== 'owner') {
      console.warn(
        'Authenticated user does not have owner role:',
        user.uid
      );

      return null;
    }

    return {
      uid: user.uid,
      role: 'owner',
      salonId: data.salonId,
      name:
        data.name ??
        user.displayName ??
        '',
      email:
        data.email ??
        user.email ??
        '',
      authProviders:
        data.authProviders ?? [],
    };
  } catch (error) {
    console.error(
      'Failed to load owner Firestore profile:',
      error
    );

    throw error;
  }
}

export function signOutOwner() {
  return firebaseSignOut(auth);
}
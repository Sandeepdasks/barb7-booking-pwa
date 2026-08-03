import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from "../lib/firebase";
import type { UserProfile } from "../types/user";
import { ROLES } from "../constants/roles";

const googleProvider = new GoogleAuthProvider();

/** Fetch the Firestore users/{uid} profile. Returns null if it doesn't exist. */
async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Customer Google Sign-In.
 * - First login: creates users/{uid} with role "customer".
 * - Every login: bumps lastLogin.
 */
async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser: FirebaseUser = result.user;

  const existing = await getUserProfile(fbUser.uid);

  if (!existing) {
    const newProfile: UserProfile = {
      uid: fbUser.uid,
      role: ROLES.CUSTOMER,
      name: fbUser.displayName ?? '',
      email: fbUser.email ?? '',
      authProviders: ['google.com'],
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    await setDoc(doc(db, 'users', fbUser.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return newProfile;
  }

  await setDoc(doc(db, 'users', fbUser.uid), { lastLogin: serverTimestamp() }, { merge: true });
  return { ...existing, lastLogin: Date.now() };
}

/**
 * Owner / Admin email+password sign-in.
 * Profile documents for owner/admin are provisioned separately (Phase 5 Admin
 * dashboard) — this only authenticates and reads the existing profile, it
 * never creates one. If no profile exists, sign-in still succeeds at the
 * Firebase Auth layer but the app cannot resolve a role.
 */
async function signInWithEmailPassword(email: string, password: string): Promise<UserProfile | null> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(result.user.uid);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to Firebase Auth state. On each change, resolves the matching
 * Firestore profile (or null) and passes both to the callback.
 */
function subscribeToAuthChanges(
  callback: (firebaseUser: FirebaseUser | null, profile: UserProfile | null) => void
): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null, null);
      return;
    }
    const profile = await getUserProfile(fbUser.uid);
    callback(fbUser, profile);
  });
}

export const authService = {
  signInWithGoogle,
  signInWithEmailPassword,
  signOutUser,
  subscribeToAuthChanges,
  getUserProfile,
};

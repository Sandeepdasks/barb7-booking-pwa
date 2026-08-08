import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import type { WorkingHours } from '@/types/owner';

import {
  DEFAULT_WORKING_HOURS,
} from '@/constants/businessHours';

/**
 * Realtime working-hours listener.
 *
 * If the salon does not yet have a Firestore workingHours
 * document, use DEFAULT_WORKING_HOURS.
 */
export function subscribeWorkingHours(
  salonId: string,
  cb: (hours: WorkingHours) => void,
  onError?: (
    error: FirestoreError
  ) => void
): Unsubscribe {
  const ref = doc(
    db,
    'workingHours',
    salonId
  );

  return onSnapshot(
    ref,

    // Success
    (snap) => {
      if (snap.exists()) {
        const data =
          snap.data() as Omit<
            WorkingHours,
            'salonId'
          >;

        cb({
          salonId,
          ...data,
        });

        return;
      }

      /**
       * No Firestore record yet.
       * Use project defaults.
       */
      cb({
        salonId,
        ...DEFAULT_WORKING_HOURS,
        updatedAt: null,
      });
    },

    // Firestore error
    (error) => {
      console.error(
        'Working hours listener failed:',
        error
      );

      onError?.(error);
    }
  );
}

/**
 * One-time read.
 */
export async function getWorkingHours(
  salonId: string
): Promise<WorkingHours> {
  const ref = doc(
    db,
    'workingHours',
    salonId
  );

  const snap =
    await getDoc(ref);

  if (snap.exists()) {
    const data =
      snap.data() as Omit<
        WorkingHours,
        'salonId'
      >;

    return {
      salonId,
      ...data,
    };
  }

  return {
    salonId,
    ...DEFAULT_WORKING_HOURS,
    updatedAt: null,
  };
}

/**
 * Save owner working hours.
 */
export async function saveWorkingHours(
  salonId: string,
  hours: Omit<
    WorkingHours,
    'salonId' | 'updatedAt'
  >
): Promise<void> {
  await setDoc(
    doc(
      db,
      'workingHours',
      salonId
    ),
    {
      ...hours,
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}
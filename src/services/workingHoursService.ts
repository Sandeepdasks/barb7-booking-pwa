import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';

// ASSUMED PATH — point this at your actual Firebase init module.
// e.g. src/firebase/config.ts, src/lib/firebase.ts, src/services/firebase.ts
import { db } from "../lib/firebase";

import type { WorkingHours, WorkingHoursDraft } from '../types/workingHours.types';

const workingHoursRef = (salonId: string) => doc(db, 'workingHours', salonId);

export async function fetchWorkingHours(salonId: string): Promise<WorkingHours | null> {
  const snap = await getDoc(workingHoursRef(salonId));
  return snap.exists() ? (snap.data() as WorkingHours) : null;
}

export function subscribeWorkingHours(
  salonId: string,
  onData: (wh: WorkingHours | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    workingHoursRef(salonId),
    (snap) => onData(snap.exists() ? (snap.data() as WorkingHours) : null),
    (err) => onError?.(err)
  );
}

export async function saveWorkingHours(salonId: string, wh: WorkingHoursDraft): Promise<void> {
  await setDoc(workingHoursRef(salonId), {
    ...wh,
    updatedAt: serverTimestamp(),
  });
}

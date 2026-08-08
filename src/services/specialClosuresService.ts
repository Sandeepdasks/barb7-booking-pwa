import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';

// ASSUMED PATH — same as workingHoursService.ts, point at actual Firebase init.
import { db } from '../firebase/config';

import type { SpecialClosure, SpecialClosureDraft } from '../types/specialClosure.types';

const COLLECTION = 'specialClosures';

// Deterministic ID mirrors the existing blockedSlots/slotLocks pattern —
// one closure per salon per date, direct O(1) read for slot-gen instead
// of a filtered query.
const closureDocId = (salonId: string, date: string) => `${salonId}_${date}`;
const closureRef = (salonId: string, date: string) => doc(db, COLLECTION, closureDocId(salonId, date));
const closuresCollection = collection(db, COLLECTION);

export async function fetchClosureForDate(
  salonId: string,
  date: string
): Promise<SpecialClosure | null> {
  const snap = await getDoc(closureRef(salonId, date));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as SpecialClosure) : null;
}

export function subscribeClosureForDate(
  salonId: string,
  date: string,
  onData: (closure: SpecialClosure | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    closureRef(salonId, date),
    (snap) => onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as SpecialClosure) : null),
    (err) => onError?.(err)
  );
}

/** Owner-portal list view: all closures for a salon, soonest first. */
export function subscribeClosures(
  salonId: string,
  onData: (closures: SpecialClosure[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(closuresCollection, where('salonId', '==', salonId), orderBy('date', 'asc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SpecialClosure))),
    (err) => onError?.(err)
  );
}

/**
 * Create or update the closure for draft.date. Preserves createdAt on
 * edit (reads first to check existence) rather than blind overwrite.
 */
export async function upsertClosure(salonId: string, draft: SpecialClosureDraft): Promise<void> {
  const ref = closureRef(salonId, draft.date);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    await setDoc(ref, { ...draft, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    await setDoc(ref, { ...draft, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function deleteClosure(salonId: string, date: string): Promise<void> {
  await deleteDoc(closureRef(salonId, date));
}

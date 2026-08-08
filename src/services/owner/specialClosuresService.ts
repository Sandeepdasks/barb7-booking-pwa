// "Special Closures" in the owner UI maps to the existing `holidays` collection
// (03-Database.md) with type='oneoff'. Recurring weekly holidays are out of scope
// for this screen (HiFi design only shows dated, one-off closures).

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SpecialClosure } from '@/types/owner';

function fromDoc(id: string, data: any): SpecialClosure {
  return {
    closureId: id,
    salonId: data.salonId,
    date: data.date,
    label: data.label ?? '',
    allDay: data.allDay ?? true,
    startTime: data.startTime ?? null,
    endTime: data.endTime ?? null,
    createdAt: data.createdAt,
  };
}

export function subscribeUpcomingClosures(
  salonId: string,
  todayDate: string,
  cb: (closures: SpecialClosure[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'holidays'),
    where('salonId', '==', salonId),
    where('type', '==', 'oneoff'),
    where('date', '>=', todayDate),
    orderBy('date', 'asc')
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => fromDoc(d.id, d.data()))));
}

export interface ClosureInput {
  salonId: string;
  date: string;
  label: string;
  allDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export async function addClosure(input: ClosureInput) {
  await addDoc(collection(db, 'holidays'), {
    ...input,
    type: 'oneoff',
    dayOfWeek: null,
    createdAt: new Date(),
  });
}

export async function updateClosure(closureId: string, input: ClosureInput) {
  await updateDoc(doc(db, 'holidays', closureId), { ...input });
}

export async function deleteClosure(closureId: string) {
  await deleteDoc(doc(db, 'holidays', closureId));
}

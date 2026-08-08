import type { Timestamp, FieldValue } from 'firebase/firestore';

export type ClosureType = 'full_day' | 'partial_day';

export interface SpecialClosure {
  id: string; // Firestore doc id, deterministic: `${salonId}_${date}`
  salonId: string;
  date: string; // "YYYY-MM-DD"
  type: ClosureType;
  startTime: string | null; // "HH:mm" — partial_day only
  endTime: string | null;   // "HH:mm" — partial_day only
  reason: string | null;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export type SpecialClosureDraft = Omit<SpecialClosure, 'id' | 'createdAt' | 'updatedAt'>;

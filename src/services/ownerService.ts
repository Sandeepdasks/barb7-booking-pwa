import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
// ASSUMPTION: adjust this import to wherever the initialized Firestore
// instance is exported from in the repo (e.g. '@/firebase/config').
import { db } from "../lib/firebase";
import type { Booking, BookingStatus, DashboardStats } from '../types/owner.types';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Real-time subscription to all bookings for a salon on a given date,
 * ordered by time. Owner Schedule screen uses this directly.
 */
export const subscribeToBookingsForDate = (
  salonId: string,
  date: string,
  onData: (bookings: Booking[]) => void,
  onError: (err: Error) => void,
): Unsubscribe => {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('salonId', '==', salonId),
    where('date', '==', date),
    orderBy('time', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings: Booking[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Booking, 'id'>),
      }));
      onData(bookings);
    },
    (err) => onError(err as Error),
  );
};

/** Owner status transitions: confirmed -> in_progress -> completed, or -> cancelled/no_show. */
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
): Promise<void> => {
  const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
};

/** Derive dashboard counters client-side from a day's bookings — no separate stats doc yet. */
export const computeDashboardStats = (bookings: Booking[]): DashboardStats => {
  const totalToday = bookings.length;
  const completedToday = bookings.filter((b) => b.status === 'completed').length;
  const pendingToday = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress',
  ).length;

  return { totalToday, completedToday, pendingToday };
};

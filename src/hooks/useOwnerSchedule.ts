import { useEffect, useMemo, useState } from 'react';
import { subscribeToBookingsForDate, updateBookingStatus } from '../services/ownerService';
import type { Booking, BookingStatus, ScheduleRow } from '../types/owner.types';

interface UseOwnerScheduleResult {
  bookings: Booking[];
  rows: ScheduleRow[];
  loading: boolean;
  error: string | null;
  setStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
}

/** Groups bookings by time slot for the Today Schedule screen. */
const groupByTime = (bookings: Booking[]): ScheduleRow[] => {
  const map = new Map<string, Booking[]>();
  for (const b of bookings) {
    const existing = map.get(b.time) ?? [];
    existing.push(b);
    map.set(b.time, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, group]) => ({ time, bookings: group }));
};

export const useOwnerSchedule = (salonId: string | null, isoDate: string): UseOwnerScheduleResult => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salonId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToBookingsForDate(
      salonId,
      isoDate,
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [salonId, isoDate]);

  const rows = useMemo(() => groupByTime(bookings), [bookings]);

  const setStatus = async (bookingId: string, status: BookingStatus): Promise<void> => {
    // Optimistic update — snappy on mobile, real-time listener reconciles after write.
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
    try {
      await updateBookingStatus(bookingId, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  return { bookings, rows, loading, error, setStatus };
};

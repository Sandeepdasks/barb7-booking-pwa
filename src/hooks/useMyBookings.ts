import { useCallback, useEffect, useState } from "react";
import { Booking } from "../types/bookingRecord";
import {
  fetchCustomerBookings,
  subscribeToCustomerBookings,
} from "../services/bookingService";

interface UseMyBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Firestore is the single source of truth — no in-memory array. The realtime
// listener means a cancellation on another device reflects here immediately;
// `refresh` exists for the pull-to-refresh gesture to await.
export function useMyBookings(customerId: string | null): UseMyBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCustomerBookings(
      customerId,
      (data) => {
        setBookings(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load bookings:", err);
        setError("Couldn't load your bookings. Pull down to try again.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [customerId]);

  const refresh = useCallback(async () => {
    if (!customerId) return;
    try {
      const data = await fetchCustomerBookings(customerId);
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
      setError("Couldn't refresh your bookings. Please try again.");
    }
  }, [customerId]);

  return { bookings, loading, error, refresh };
}
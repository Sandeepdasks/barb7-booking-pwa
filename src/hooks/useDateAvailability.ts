import { useEffect, useMemo, useState } from "react";
import { Booking } from "../types/bookingRecord";
import { subscribeToConfirmedBookingsForDate } from "../services/bookingService";
import { getOccupiedSlots } from "../utils/bookingAvailability";

interface UseDateAvailabilityResult {
  occupiedSlots: Set<string>;
  loading: boolean;
  error: string | null;
}

// Live availability for one salon+date. Because this is an onSnapshot
// listener, a booking made on another device removes the slot here without a
// refresh — and the data survives page reloads because it's read from
// Firestore, not memory.
export function useDateAvailability(
  salonId: string,
  dateKey: string,
  baseSlotIntervalMinutes: number
): UseDateAvailabilityResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToConfirmedBookingsForDate(
      salonId,
      dateKey,
      (data) => {
        setBookings(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load availability:", err);
        // Fail CLOSED-ish: surface the error rather than silently showing every
        // slot as free, which would invite double bookings.
        setError("Couldn't load availability. Please try again.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [salonId, dateKey]);

  const occupiedSlots = useMemo(
    () => getOccupiedSlots(bookings, baseSlotIntervalMinutes),
    [bookings, baseSlotIntervalMinutes]
  );

  return { occupiedSlots, loading, error };
}
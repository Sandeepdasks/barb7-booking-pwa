import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

interface UseDateAvailabilityResult {
  occupiedSlots: Set<string>;
  loading: boolean;
  error: string | null;
}

export function useDateAvailability(
  salonId: string,
  dateKey: string
): UseDateAvailabilityResult {
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salonId || !dateKey) {
      setOccupiedSlots(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "slotLocks"),
      where("salonId", "==", salonId),
      where("date", "==", dateKey)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const occupied = new Set<string>();

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.time) {
            occupied.add(data.time);
          }
        });

        setOccupiedSlots(occupied);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load availability:", err);
        setError("Couldn't load availability. Please try again.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [salonId, dateKey]);

  return useMemo(
    () => ({
      occupiedSlots,
      loading,
      error,
    }),
    [occupiedSlots, loading, error]
  );
}
import { useEffect, useState } from 'react';
import { subscribeWorkingHours } from '../services/workingHoursService';
import type { WorkingHours } from '../types/workingHours.types';

interface UseSalonWorkingHoursResult {
  workingHours: WorkingHours | null;
  loading: boolean;
  error: string | null;
}

/**
 * Customer-side, read-only. Use this to replace the previous hardcoded
 * working-hours mock in the booking / availability screens. Real-time:
 * owner edits reflect immediately without a page refresh.
 */
export function useSalonWorkingHours(salonId: string): UseSalonWorkingHoursResult {
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salonId) return;
    const unsubscribe = subscribeWorkingHours(
      salonId,
      (wh) => {
        setWorkingHours(wh);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [salonId]);

  return { workingHours, loading, error };
}

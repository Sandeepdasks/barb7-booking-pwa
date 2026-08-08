import { useEffect, useState } from 'react';
import { subscribeClosureForDate } from '../services/specialClosuresService';
import type { SpecialClosure } from '../types/specialClosure.types';

interface UseClosureForDateResult {
  closure: SpecialClosure | null;
  loading: boolean;
}

/**
 * Real-time lookup of the specialClosures doc (if any) for one date.
 * Use this in:
 *  - customer booking flow, alongside useSalonWorkingHours, feeding both
 *    into generateAvailableSlots(date, workingHours, closure)
 *  - existing owner Schedule page, to show a "Closed — <reason>" banner
 *    for the selected day (small addition, not a rewrite)
 */
export function useClosureForDate(salonId: string, date: string): UseClosureForDateResult {
  const [closure, setClosure] = useState<SpecialClosure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId || !date) return;
    setLoading(true);
    const unsubscribe = subscribeClosureForDate(salonId, date, (c) => {
      setClosure(c);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [salonId, date]);

  return { closure, loading };
}

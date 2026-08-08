import { useCallback, useEffect, useState } from 'react';
import { subscribeWorkingHours, saveWorkingHours } from '../services/workingHoursService';
import { DEFAULT_WORKING_HOURS } from '../constants/workingHours.constants';
import type { WorkingHours, WorkingHoursDraft } from '../types/workingHours.types';

interface UseWorkingHoursResult {
  workingHours: WorkingHours | WorkingHoursDraft | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  save: (wh: WorkingHoursDraft) => Promise<void>;
}

/**
 * Owner-side hook. Subscribes in real time to workingHours/{salonId}.
 * If no doc exists yet, seeds UI with DEFAULT_WORKING_HOURS (not written
 * until owner explicitly saves).
 */
export function useWorkingHours(salonId: string): UseWorkingHoursResult {
  const [workingHours, setWorkingHours] = useState<WorkingHours | WorkingHoursDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    const unsubscribe = subscribeWorkingHours(
      salonId,
      (wh) => {
        setWorkingHours(wh ?? DEFAULT_WORKING_HOURS);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [salonId]);

  const save = useCallback(
    async (wh: WorkingHoursDraft) => {
      setSaving(true);
      setError(null);
      try {
        await saveWorkingHours(salonId, wh);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save working hours');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [salonId]
  );

  return { workingHours, loading, error, saving, save };
}

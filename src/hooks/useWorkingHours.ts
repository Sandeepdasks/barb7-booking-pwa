import { useEffect, useState } from 'react';
import { fetchWorkingHours } from '../services/mockWorkingHoursService';
import { WorkingHours } from '../types/workingHours';

interface UseWorkingHoursResult {
  workingHours: WorkingHours | null;
  loading: boolean;
  error: string | null;
}

export function useWorkingHours(salonId: string): UseWorkingHoursResult {
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWorkingHours(salonId)
      .then((data) => { if (!cancelled) setWorkingHours(data); })
      .catch(() => { if (!cancelled) setError('Could not load working hours.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [salonId]);

  return { workingHours, loading, error };
}
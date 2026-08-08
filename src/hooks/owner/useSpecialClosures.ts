import { useEffect, useState } from 'react';
import {
  subscribeUpcomingClosures,
  addClosure,
  updateClosure,
  deleteClosure,
  type ClosureInput,
} from '@/services/owner/specialClosuresService';
import type { SpecialClosure } from '@/types/owner';

function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function useSpecialClosures(salonId: string | undefined) {
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId) return;
    const unsub = subscribeUpcomingClosures(salonId, todayIST(), (data) => {
      setClosures(data);
      setLoading(false);
    });
    return unsub;
  }, [salonId]);

  return {
    closures,
    loading,
    add: (input: ClosureInput) => addClosure(input),
    update: (id: string, input: ClosureInput) => updateClosure(id, input),
    remove: (id: string) => deleteClosure(id),
  };
}

import { useEffect, useState } from 'react';
import { subscribeSlotLocksForDate } from '@/services/owner/scheduleService';
import type { SlotLock } from '@/types/owner';

// Thin shared subscription — reused by useSchedule (Owner Schedule's blocked-bar rendering,
// filtered to type==='owner_blocked') and OwnerAddBookingPage (availability engine, all types).
// One listener implementation, two different filters downstream — not two occupancy systems.
export function useSlotLocksForDate(salonId: string | undefined, date: string) {
  const [slotLocks, setSlotLocks] = useState<SlotLock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    setSlotLocks([]);
    const unsub = subscribeSlotLocksForDate(salonId, date, (data) => {
      setSlotLocks(data);
      setLoading(false);
    });
    return unsub;
  }, [salonId, date]);

  return { slotLocks, loading };
}

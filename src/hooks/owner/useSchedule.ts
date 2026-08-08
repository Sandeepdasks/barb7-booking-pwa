import { useEffect, useMemo, useState } from 'react';
import { subscribeAppointmentsForDate } from '@/services/owner/scheduleService';
import { useSlotLocksForDate } from '@/hooks/owner/useSlotLocksForDate';
import { groupOwnerBlockedSlots } from '@/utils/scheduleTimeline';
import type { Appointment, BlockedEventGroup } from '@/types/owner';

export function useSchedule(salonId: string | undefined, date: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptsLoading, setApptsLoading] = useState(true);
  const { slotLocks, loading: locksLoading } = useSlotLocksForDate(salonId, date);

  useEffect(() => {
    if (!salonId) return;
    setApptsLoading(true);
    setAppointments([]);
    const unsub = subscribeAppointmentsForDate(salonId, date, (data) => {
      setAppointments(data);
      setApptsLoading(false);
    });
    return unsub;
  }, [salonId, date]);

  // Owner Schedule only ever renders the 'owner_blocked' subset of slotLocks — normal booking
  // locks (type: 'appointment') are a pure collision guard, never shown as a bar here (the
  // matching `appointments` doc is what renders those). See groupOwnerBlockedSlots.
  const blockedGroups: BlockedEventGroup[] = useMemo(() => groupOwnerBlockedSlots(slotLocks), [slotLocks]);

  return { appointments, slotLocks, blockedGroups, loading: apptsLoading || locksLoading };
}

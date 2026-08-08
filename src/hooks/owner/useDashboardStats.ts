import { useEffect, useMemo, useState } from 'react';

import { subscribeAppointmentsForDate } from '@/services/owner/scheduleService';

import type {
  Appointment,
  DashboardStats,
} from '@/types/owner';

function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
}

export function useDashboardStats(
  salonId: string | undefined
) {
  const date = todayIST();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!salonId) {
      setAppointments([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeAppointmentsForDate(
      salonId,
      date,
      (data) => {
        setAppointments(data);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [salonId, date]);

  const stats: DashboardStats = useMemo(() => {
    // Cancelled appointments should not be included
    // in today's total booking count.
    const activeAppointments = appointments.filter(
      (appointment) =>
        appointment.status !== 'cancelled_by_owner' &&
        appointment.status !== 'cancelled_by_customer'
    );

    // Confirmed appointments = pending tasks.
    const pendingCount = appointments.filter(
      (appointment) =>
        appointment.status === 'confirmed'
    ).length;

    // Completed appointments.
    const completedCount = appointments.filter(
      (appointment) =>
        appointment.status === 'completed'
    ).length;

    return {
      bookingsToday: activeAppointments.length,
      pending: pendingCount,
      completed: completedCount,

      // Currently unused by the redesigned dashboard.
      inProgress: 0,
    };
  }, [appointments]);

  return {
    stats,
    date,
    loading,
    error,
  };
}
import { useEffect, useState } from 'react';

import {
  subscribeWorkingHours,
  saveWorkingHours,
} from '@/services/owner/workingHoursService';

import type { WorkingHours } from '@/types/owner';

export function useWorkingHours(
  salonId: string | undefined
) {
  const [hours, setHours] =
    useState<WorkingHours | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    /**
     * Owner profile may not be ready on the first render.
     */
    if (!salonId) {
      setHours(null);
      setLoading(false);
      setError(null);

      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe =
      subscribeWorkingHours(
        salonId,

        // Success
        (data) => {
          console.log(
            'WORKING HOURS LOADED:',
            data
          );

          setHours(data);
          setLoading(false);
          setError(null);
        },

        // Error
        (err) => {
          console.error(
            'Failed to load working hours:',
            err
          );

          setHours(null);

          setError(
            'Could not load working hours.'
          );

          setLoading(false);
        }
      );

    return () => {
      unsubscribe();
    };
  }, [salonId]);

  async function save(
    next: Omit<
      WorkingHours,
      'salonId' | 'updatedAt'
    >
  ) {
    if (!salonId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveWorkingHours(
        salonId,
        next
      );
    } catch (err) {
      console.error(
        'Failed to save working hours:',
        err
      );

      setError(
        'Could not save working hours.'
      );

      throw err;
    } finally {
      setSaving(false);
    }
  }

  return {
    hours,
    loading,
    saving,
    error,
    save,
  };
}
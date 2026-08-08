import { useCallback, useEffect, useState } from 'react';
import {
  subscribeClosures,
  upsertClosure,
  deleteClosure,
} from '../services/specialClosuresService';
import type { SpecialClosure, SpecialClosureDraft } from '../types/specialClosure.types';

interface UseSpecialClosuresResult {
  closures: SpecialClosure[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  /** originalDate: pass when editing and the date itself changed, so the
   *  old deterministic doc ({salonId}_{oldDate}) is removed. */
  save: (draft: SpecialClosureDraft, originalDate?: string) => Promise<void>;
  remove: (date: string) => Promise<void>;
}

export function useSpecialClosures(salonId: string): UseSpecialClosuresResult {
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!salonId) return;
    const unsubscribe = subscribeClosures(
      salonId,
      (list) => {
        setClosures(list);
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
    async (draft: SpecialClosureDraft, originalDate?: string) => {
      setSaving(true);
      setError(null);
      try {
        if (originalDate && originalDate !== draft.date) {
          await deleteClosure(salonId, originalDate);
        }
        await upsertClosure(salonId, draft);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save closure');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [salonId]
  );

  const remove = useCallback(
    async (date: string) => {
      setSaving(true);
      setError(null);
      try {
        await deleteClosure(salonId, date);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete closure');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [salonId]
  );

  return { closures, loading, error, saving, save, remove };
}

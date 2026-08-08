import {
  useEffect,
  useState,
} from 'react';

import {
  subscribeClosuresForDate,
} from '../services/specialClosuresService';

import type {
  SpecialClosure,
} from '../types/specialClosure.types';

interface UseClosuresForDateResult {
  closures: SpecialClosure[];
  loading: boolean;
}

export function useClosureForDate(
  salonId: string,
  date: string
): UseClosuresForDateResult {
  const [
    closures,
    setClosures,
  ] = useState<
    SpecialClosure[]
  >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    if (
      !salonId ||
      !date
    ) {
      setClosures([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe =
      subscribeClosuresForDate(
        salonId,
        date,
        (data) => {
          setClosures(
            data
          );

          setLoading(
            false
          );
        }
      );

    return () =>
      unsubscribe();
  }, [
    salonId,
    date,
  ]);

  return {
    closures,
    loading,
  };
}
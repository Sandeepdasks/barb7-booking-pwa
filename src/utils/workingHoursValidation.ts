import type {
  DayKey,
  WorkingHoursDraft,
} from '../types/workingHours.types';

import {
  DAY_KEYS,
} from '../constants/workingHours.constants';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

function toMinutes(
  time: string | undefined | null
): number | null {
  if (!time) {
    return null;
  }

  const parts =
    time.split(':');

  if (parts.length !== 2) {
    return null;
  }

  const hours =
    Number(parts[0]);

  const minutes =
    Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return (
    hours * 60 +
    minutes
  );
}

export function validateWorkingHours(
  draft: WorkingHoursDraft
): ValidationResult {
  const errors: string[] = [];

  const fieldErrors:
    Record<string, string> =
    {};

  /* --------------------------------------------------------------
     DAY VALIDATION
  --------------------------------------------------------------- */

  DAY_KEYS.forEach(
    (dayKey: DayKey) => {
      const schedule =
        draft[dayKey];

      if (!schedule) {
        const message =
          'Schedule is missing.';

        fieldErrors[dayKey] =
          message;

        errors.push(
          `${dayKey}: ${message}`
        );

        return;
      }

      /*
       * Closed days do not need time validation.
       */
      if (schedule.isClosed) {
        return;
      }

      const openMinutes =
        toMinutes(
          schedule.openTime
        );

      const closeMinutes =
        toMinutes(
          schedule.closeTime
        );

      if (
        openMinutes === null ||
        closeMinutes === null
      ) {
        const message =
          'Enter valid opening and closing times.';

        fieldErrors[dayKey] =
          message;

        errors.push(
          `${dayKey}: ${message}`
        );

        return;
      }

      if (
        closeMinutes <=
        openMinutes
      ) {
        const message =
          'Closing time must be after opening time.';

        fieldErrors[dayKey] =
          message;

        errors.push(
          `${dayKey}: ${message}`
        );
      }
    }
  );

  /* --------------------------------------------------------------
     LUNCH BREAK
  --------------------------------------------------------------- */

  const lunchStart =
    toMinutes(
      draft.lunchBreak?.start
    );

  const lunchEnd =
    toMinutes(
      draft.lunchBreak?.end
    );

  if (
    lunchStart === null ||
    lunchEnd === null
  ) {
    const message =
      'Enter valid lunch break times.';

    fieldErrors.lunchBreak =
      message;

    errors.push(message);
  } else if (
    lunchEnd <= lunchStart
  ) {
    const message =
      'Lunch break end time must be after start time.';

    fieldErrors.lunchBreak =
      message;

    errors.push(message);
  }

  /* --------------------------------------------------------------
     SLOT INTERVAL
  --------------------------------------------------------------- */

  const validIntervals = [
    15,
    30,
    45,
    60,
  ];

  if (
    !validIntervals.includes(
      draft.slotIntervalMinutes
    )
  ) {
    const message =
      'Choose a valid slot interval.';

    fieldErrors.slotIntervalMinutes =
      message;

    errors.push(message);
  }

  return {
    valid:
      errors.length === 0,

    errors,

    fieldErrors,
  };
}
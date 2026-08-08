import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { DayScheduleCard } from './DayScheduleCard';
import { LunchBreakEditor } from './LunchBreakEditor';
import { SlotIntervalSelector } from './SlotIntervalSelector';
import { DAY_KEYS } from '../../../constants/workingHours.constants';
import { validateWorkingHours } from '../../../utils/workingHoursValidation';
import type {
  DayKey,
  DaySchedule,
  LunchBreak,
  SlotIntervalMinutes,
  WorkingHoursDraft,
} from '../../../types/workingHours.types';

// ASSUMED — replace with your existing toast hook/import.
// e.g. import { useToast } from '../../../hooks/useToast';

interface WorkingHoursFormProps {
  initial: WorkingHoursDraft;
  onSave: (wh: WorkingHoursDraft) => Promise<void>;
  // 2026-08-08: the Save button moved to the page's sticky footer (was a `fixed inset-x-4
  // bottom-4` button rendered inline here, which could overlap the last card and didn't
  // respect the page's own scroll region). This form no longer renders its own button —
  // it reports dirty state up so the page can enable/disable the footer button, and exposes
  // `triggerSave` via ref so the page's button can invoke this form's existing save flow
  // (validation, error alert, dirty-reset) unchanged. `saving` moved with the button — the
  // page now owns disabling its own button while a save is in flight.
  onDirtyChange?: (dirty: boolean) => void;
}

export interface WorkingHoursFormHandle {
  triggerSave: () => void;
}

export const WorkingHoursForm = forwardRef<WorkingHoursFormHandle, WorkingHoursFormProps>(
  function WorkingHoursForm({ initial, onSave, onDirtyChange }, ref) {
    const [draft, setDraft] = useState<WorkingHoursDraft>(initial);
    const [dirty, setDirty] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // resync if a real-time update arrives from Firestore while not mid-edit
    useEffect(() => {
      if (!dirty) setDraft(initial);
    }, [initial, dirty]);

    useEffect(() => {
      onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

    const updateDay = (dayKey: DayKey, schedule: DaySchedule) => {
      setDraft((prev) => ({ ...prev, [dayKey]: schedule }));
      setDirty(true);
    };

    const updateLunch = (lunchBreak: LunchBreak) => {
      setDraft((prev) => ({ ...prev, lunchBreak }));
      setDirty(true);
    };

    const updateInterval = (slotIntervalMinutes: SlotIntervalMinutes) => {
      setDraft((prev) => ({ ...prev, slotIntervalMinutes }));
      setDirty(true);
    };

    const handleSave = async () => {
      const result = validateWorkingHours(draft);
      setFieldErrors(result.fieldErrors);
      if (!result.valid) {
        alert(result.errors[0]);
        return;
      }
      try {
        await onSave(draft);
        setDirty(false);
        console.log("Working hours updated");
      } catch {
        alert("Could not save working hours. Try again.");
      }
    };

    useImperativeHandle(ref, () => ({ triggerSave: handleSave }));

    return (
      <div className="space-y-4">
        {DAY_KEYS.map((dayKey) => (
          <DayScheduleCard
            key={dayKey}
            dayKey={dayKey}
            schedule={draft[dayKey]}
            error={fieldErrors[dayKey]}
            onChange={updateDay}
          />
        ))}

        <LunchBreakEditor
          lunchBreak={draft.lunchBreak}
          error={fieldErrors.lunchBreak}
          onChange={updateLunch}
        />

        <SlotIntervalSelector
          value={draft.slotIntervalMinutes}
          error={fieldErrors.slotIntervalMinutes}
          onChange={updateInterval}
        />
      </div>
    );
  }
);

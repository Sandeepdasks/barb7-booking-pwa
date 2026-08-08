import { useEffect, useState } from 'react';
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
  saving: boolean;
  onSave: (wh: WorkingHoursDraft) => Promise<void>;
}

export function WorkingHoursForm({ initial, saving, onSave }: WorkingHoursFormProps) {
  const [draft, setDraft] = useState<WorkingHoursDraft>(initial);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  

  // resync if a real-time update arrives from Firestore while not mid-edit
  useEffect(() => {
    if (!dirty) setDraft(initial);
  }, [initial, dirty]);

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

  return (
    <div className="space-y-4 pb-24">
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

      <button
        type="button"
        disabled={!dirty || saving}
        onClick={handleSave}
        className="fixed inset-x-4 bottom-4 rounded-xl bg-emerald-500 py-3 font-semibold text-zinc-950 disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

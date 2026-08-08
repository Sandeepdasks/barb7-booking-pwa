import { useState, useEffect } from 'react';
import { OwnerCard, OwnerToggle, OwnerTimeInput, OwnerButton, StickyActionBar } from '@/components/owner/ui';
import type { WorkingHours, Weekday } from '@/types/owner';

const DAY_ORDER: { key: Weekday; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function WorkingHoursForm({
  hours,
  saving,
  onSave,
}: {
  hours: WorkingHours;
  saving: boolean;
  onSave: (next: Omit<WorkingHours, 'salonId' | 'updatedAt'>) => void;
}) {
  const [draft, setDraft] = useState(hours);
  useEffect(() => setDraft(hours), [hours]);

  function updateDay(day: Weekday, patch: Partial<WorkingHours[Weekday]>) {
    setDraft((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  // Validation: open < close, minimum 1hr working duration.
  const errors = DAY_ORDER.filter(({ key }) => {
    const d = draft[key];
    if (d.closed) return false;
    const [oh, om] = d.start.split(':').map(Number);
    const [ch, cm] = d.end.split(':').map(Number);
    return oh * 60 + om >= ch * 60 + cm - 59;
  }).map((d) => d.label);

  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-[#6E7482]">
          Weekly Schedule
        </h2>
        {DAY_ORDER.map(({ key, label }) => {
          const day = draft[key];
          return (
            <OwnerCard key={key}>
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#F5F5F5]">{label}</span>
                <OwnerToggle checked={!day.closed} onChange={(open) => updateDay(key, { closed: !open })} />
              </div>
              {!day.closed && (
                <div className="mt-3 flex items-center gap-3">
                  <OwnerTimeInput value={day.start} onChange={(v) => updateDay(key, { start: v })} />
                  <span className="text-[#6E7482]">to</span>
                  <OwnerTimeInput value={day.end} onChange={(v) => updateDay(key, { end: v })} />
                </div>
              )}
              {day.closed && <div className="mt-1 text-[13px] text-[#6E7482]">Closed</div>}
            </OwnerCard>
          );
        })}

        <h2 className="mt-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#6E7482]">
          Lunch Break (Every day)
        </h2>
        <OwnerCard>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-[#6E7482]">Start</label>
              <OwnerTimeInput
                value={draft.breakStart}
                onChange={(v) => setDraft((p) => ({ ...p, breakStart: v }))}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-[#6E7482]">End</label>
              <OwnerTimeInput
                value={draft.breakEnd}
                onChange={(v) => setDraft((p) => ({ ...p, breakEnd: v }))}
              />
            </div>
          </div>
        </OwnerCard>

        {errors.length > 0 && (
          <p className="px-1 text-[13px] text-[#E5484D]">
            Check hours for: {errors.join(', ')} — minimum 1 hour, open time must be before close time.
          </p>
        )}
      </div>

      <StickyActionBar>
        <OwnerButton
          variant="primary"
          fullWidth
          loading={saving}
          disabled={errors.length > 0}
          onClick={() =>
            onSave({
              monday: draft.monday,
              tuesday: draft.tuesday,
              wednesday: draft.wednesday,
              thursday: draft.thursday,
              friday: draft.friday,
              saturday: draft.saturday,
              sunday: draft.sunday,
              breakStart: draft.breakStart,
              breakEnd: draft.breakEnd,
            })
          }
        >
          Save Changes
        </OwnerButton>
      </StickyActionBar>
    </>
  );
}

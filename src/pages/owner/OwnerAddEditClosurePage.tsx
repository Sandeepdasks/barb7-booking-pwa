import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { useSpecialClosures } from '@/hooks/owner/useSpecialClosures';
import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';
import { OwnerButton, OwnerToggle, StickyActionBar } from '@/components/owner/ui';

function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function OwnerAddEditClosurePage() {
  const navigate = useNavigate();
  const { closureId } = useParams<{ closureId: string }>();
  const isEdit = !!closureId;
  const { ownerProfile } = useOwnerAuth();
  const { closures, add, update } = useSpecialClosures(ownerProfile?.salonId);

  const existing = isEdit ? closures.find((c) => c.closureId === closureId) : undefined;

  const [date, setDate] = useState(todayIST());
  const [label, setLabel] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setDate(existing.date);
      setLabel(existing.label);
      setAllDay(existing.allDay);
      setStartTime(existing.startTime ?? '10:00');
      setEndTime(existing.endTime ?? '14:00');
    }
  }, [existing]);

  const canSave = date && label.trim() && (allDay || (startTime && endTime && startTime < endTime));

  async function handleSave() {
    if (!ownerProfile || !canSave) return;
    setSaving(true);
    try {
      const input = {
        salonId: ownerProfile.salonId,
        date,
        label: label.trim(),
        allDay,
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
      };
      if (isEdit && closureId) {
        await update(closureId, input);
      } else {
        await add(input);
      }
      navigate('/owner/settings/special-closures');
    } finally {
      setSaving(false);
    }
  }

  return (
    <OwnerPageShell
      header={
        <OwnerHeader
          title={isEdit ? 'Edit Closure' : 'Add Closure'}
          onBack={() => navigate('/owner/settings/special-closures')}
        />
      }
      footer={
        <StickyActionBar>
          <div className="flex gap-3">
            <OwnerButton
              variant="secondary"
              fullWidth
              onClick={() => navigate('/owner/settings/special-closures')}
            >
              Cancel
            </OwnerButton>
            <OwnerButton variant="primary" fullWidth disabled={!canSave} loading={saving} onClick={handleSave}>
              Save
            </OwnerButton>
          </div>
        </StickyActionBar>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-xl border border-[#2B3240] bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">Reason</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Independence Day"
            className="h-12 w-full rounded-xl border border-[#2B3240] bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
          />
        </label>

        <div className="flex items-center justify-between rounded-2xl border border-[#2B3240] bg-[#151922] p-4">
          <span className="text-[14px] text-[#F5F5F5]">Close shop for the entire day</span>
          <OwnerToggle checked={allDay} onChange={setAllDay} />
        </div>

        {!allDay && (
          <div className="flex items-center gap-3">
            <label className="flex-1">
              <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">From</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#2B3240] bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
              />
            </label>
            <label className="flex-1">
              <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">To</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#2B3240] bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#C8A06B]"
              />
            </label>
          </div>
        )}
      </div>
    </OwnerPageShell>
  );
}

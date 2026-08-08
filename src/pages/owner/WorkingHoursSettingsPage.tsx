import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { useWorkingHours } from '@/hooks/owner/useWorkingHours';

import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';
import { OwnerButton, StickyActionBar } from '@/components/owner/ui';

import {
  WorkingHoursForm,
  type WorkingHoursFormHandle,
} from '@/components/owner/working-hours/WorkingHoursForm';

import type {
  WorkingHours as OwnerWorkingHours,
} from '@/types/owner';

import type {
  SlotIntervalMinutes,
  WorkingHoursDraft,
} from '@/types/workingHours.types';

/* ------------------------------------------------------------------
   CONSTANTS
------------------------------------------------------------------- */

const DEFAULT_SLOT_INTERVAL: SlotIntervalMinutes = 15;

/* ------------------------------------------------------------------
   OWNER MODEL → FORM MODEL
------------------------------------------------------------------- */

function toWorkingHoursDraft(
  hours: OwnerWorkingHours
): WorkingHoursDraft {
  return {
    monday: {
      isClosed: hours.monday.closed,
      openTime: hours.monday.start,
      closeTime: hours.monday.end,
    },

    tuesday: {
      isClosed: hours.tuesday.closed,
      openTime: hours.tuesday.start,
      closeTime: hours.tuesday.end,
    },

    wednesday: {
      isClosed: hours.wednesday.closed,
      openTime: hours.wednesday.start,
      closeTime: hours.wednesday.end,
    },

    thursday: {
      isClosed: hours.thursday.closed,
      openTime: hours.thursday.start,
      closeTime: hours.thursday.end,
    },

    friday: {
      isClosed: hours.friday.closed,
      openTime: hours.friday.start,
      closeTime: hours.friday.end,
    },

    saturday: {
      isClosed: hours.saturday.closed,
      openTime: hours.saturday.start,
      closeTime: hours.saturday.end,
    },

    sunday: {
      isClosed: hours.sunday.closed,
      openTime: hours.sunday.start,
      closeTime: hours.sunday.end,
    },

    lunchBreak: {
      start: hours.breakStart,
      end: hours.breakEnd,
    },

    slotIntervalMinutes:
      (hours.slotIntervalMinutes ??
        DEFAULT_SLOT_INTERVAL) as SlotIntervalMinutes,
  };
}

/* ------------------------------------------------------------------
   FORM MODEL → OWNER MODEL
------------------------------------------------------------------- */

function fromWorkingHoursDraft(
  draft: WorkingHoursDraft
): Omit<
  OwnerWorkingHours,
  'salonId' | 'updatedAt'
> {
  return {
    monday: {
      start: draft.monday.openTime,
      end: draft.monday.closeTime,
      closed: draft.monday.isClosed,
    },

    tuesday: {
      start: draft.tuesday.openTime,
      end: draft.tuesday.closeTime,
      closed: draft.tuesday.isClosed,
    },

    wednesday: {
      start: draft.wednesday.openTime,
      end: draft.wednesday.closeTime,
      closed: draft.wednesday.isClosed,
    },

    thursday: {
      start: draft.thursday.openTime,
      end: draft.thursday.closeTime,
      closed: draft.thursday.isClosed,
    },

    friday: {
      start: draft.friday.openTime,
      end: draft.friday.closeTime,
      closed: draft.friday.isClosed,
    },

    saturday: {
      start: draft.saturday.openTime,
      end: draft.saturday.closeTime,
      closed: draft.saturday.isClosed,
    },

    sunday: {
      start: draft.sunday.openTime,
      end: draft.sunday.closeTime,
      closed: draft.sunday.isClosed,
    },

    breakStart: draft.lunchBreak.start,
    breakEnd: draft.lunchBreak.end,

    slotIntervalMinutes:
      draft.slotIntervalMinutes,
  };
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */

export function WorkingHoursSettingsPage() {
  const navigate =
    useNavigate();

  const {
    ownerProfile,
  } = useOwnerAuth();

  const {
    hours,
    loading,
    saving,
    error,
    save,
  } = useWorkingHours(
    ownerProfile?.salonId
  );

  const formRef =
    useRef<WorkingHoursFormHandle>(
      null
    );

  const [
    dirty,
    setDirty,
  ] = useState(false);

  const initialDraft =
    hours
      ? toWorkingHoursDraft(
          hours
        )
      : null;

  async function handleSave(
    draft: WorkingHoursDraft
  ) {
    const converted =
      fromWorkingHoursDraft(
        draft
      );

    await save(
      converted
    );
  }

  return (
    <OwnerPageShell
      header={
        <OwnerHeader
          title="Working Hours"
          onBack={() =>
            navigate(-1)
          }
        />
      }
      footer={
        !loading &&
        !error &&
        initialDraft ? (
          <StickyActionBar>
            <OwnerButton
              variant="primary"
              fullWidth
              disabled={
                !dirty ||
                saving
              }
              loading={
                saving
              }
              onClick={() =>
                formRef.current?.triggerSave()
              }
            >
              Save Changes
            </OwnerButton>
          </StickyActionBar>
        ) : undefined
      }
    >
      <div className="px-4 pt-4">
        {loading && (
          <p className="text-sm text-[#6E7482]">
            Loading…
          </p>
        )}

        {!loading &&
          error && (
            <p className="text-sm text-[#E5484D]">
              {error}
            </p>
          )}

        {!loading &&
          !error &&
          initialDraft && (
            <WorkingHoursForm
              ref={
                formRef
              }
              initial={
                initialDraft
              }
              onSave={
                handleSave
              }
              onDirtyChange={
                setDirty
              }
            />
          )}

        {!loading &&
          !error &&
          !initialDraft && (
            <p className="text-sm text-[#6E7482]">
              Working hours are not available.
            </p>
          )}
      </div>
    </OwnerPageShell>
  );
}

export default WorkingHoursSettingsPage;
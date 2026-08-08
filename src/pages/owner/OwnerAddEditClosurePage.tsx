import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  useOwnerAuth,
} from '@/contexts/OwnerAuthContext';

import {
  useSpecialClosures,
} from '@/hooks/owner/useSpecialClosures';

import {
  OwnerPageShell,
} from '@/components/owner/layout/OwnerPageShell';

import {
  OwnerHeader,
} from '@/components/owner/layout/OwnerHeader';

import {
  OwnerButton,
  StickyActionBar,
} from '@/components/owner/ui';

import { Switch } from '@headlessui/react';

/* ------------------------------------------------------------------
   TODAY — IST
------------------------------------------------------------------- */

function todayIST(): string {
  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone:
        'Asia/Kolkata',
    }
  ).format(
    new Date()
  );
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */

export function OwnerAddEditClosurePage() {
  const navigate =
    useNavigate();

  const {
    closureId,
  } =
    useParams<{
      closureId: string;
    }>();

  const isEdit =
    !!closureId;

  const {
    ownerProfile,
  } =
    useOwnerAuth();

  const {
    closures,
    add,
    update,
  } =
    useSpecialClosures(
      ownerProfile?.salonId
    );

  const existing =
    isEdit
      ? closures.find(
          (closure) =>
            closure.closureId ===
            closureId
        )
      : undefined;

  /* ----------------------------------------------------------------
     FORM STATE
  ---------------------------------------------------------------- */

  const [
    date,
    setDate,
  ] =
    useState(
      todayIST()
    );

  const [
    label,
    setLabel,
  ] =
    useState('');

  const [
    allDay,
    setAllDay,
  ] =
    useState(true);

  const [
    startTime,
    setStartTime,
  ] =
    useState(
      '10:00'
    );

  const [
    endTime,
    setEndTime,
  ] =
    useState(
      '14:00'
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  /* ----------------------------------------------------------------
     LOAD EXISTING CLOSURE
  ---------------------------------------------------------------- */

  useEffect(() => {
    if (!existing) {
      return;
    }

    setDate(
      existing.date
    );

    setLabel(
      existing.label
    );

    setAllDay(
      existing.allDay
    );

    setStartTime(
      existing.startTime ??
        '10:00'
    );

    setEndTime(
      existing.endTime ??
        '14:00'
    );
  }, [
    existing,
  ]);

  /* ----------------------------------------------------------------
     VALIDATION
  ---------------------------------------------------------------- */

  const canSave =
    Boolean(
      date &&
        label.trim() &&
        (
          allDay ||
          (
            startTime &&
            endTime &&
            startTime <
              endTime
          )
        )
    );

  /* ----------------------------------------------------------------
     SAVE
  ---------------------------------------------------------------- */

  async function handleSave() {
    if (
      !ownerProfile ||
      !canSave
    ) {
      return;
    }

    setSaving(true);

    try {
      const input = {
        salonId:
          ownerProfile.salonId,

        date,

        label:
          label.trim(),

        allDay,

        startTime:
          allDay
            ? null
            : startTime,

        endTime:
          allDay
            ? null
            : endTime,
      };

      if (
        isEdit &&
        closureId
      ) {
        await update(
          closureId,
          input
        );
      } else {
        await add(
          input
        );
      }

      navigate(
        '/owner/settings/special-closures'
      );
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------------------------------------------
     UI
  ---------------------------------------------------------------- */

  return (
    <OwnerPageShell
      header={
        <OwnerHeader
          title={
            isEdit
              ? 'Edit Closure'
              : 'Add Closure'
          }
          onBack={() =>
            navigate(
              '/owner/settings/special-closures'
            )
          }
        />
      }
      footer={
        <StickyActionBar>
          <div className="flex gap-3">
            <OwnerButton
              variant="secondary"
              fullWidth
              onClick={() =>
                navigate(
                  '/owner/settings/special-closures'
                )
              }
            >
              Cancel
            </OwnerButton>

            <OwnerButton
              variant="primary"
              fullWidth
              disabled={
                !canSave
              }
              loading={
                saving
              }
              onClick={
                handleSave
              }
            >
              Save
            </OwnerButton>
          </div>
        </StickyActionBar>
      }
    >
      <div className="flex flex-col gap-4">
        {/* DATE */}

        <label className="block">
          <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">
            Date
          </span>

          <input
            type="date"
            value={
              date
            }
            min={
              todayIST()
            }
            onChange={(
              event
            ) =>
              setDate(
                event.target.value
              )
            }
            className={[
              'h-12 w-full rounded-xl border border-[#2B3240]',
              'bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5]',
              'focus:border-[#C8A06B] focus:outline-none',
              '[color-scheme:dark]',
            ].join(' ')}
          />
        </label>

        {/* REASON */}

        <label className="block">
          <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">
            Reason
          </span>

          <input
            type="text"
            value={
              label
            }
            onChange={(
              event
            ) =>
              setLabel(
                event.target.value
              )
            }
            placeholder="e.g. Independence Day"
            className={[
              'h-12 w-full rounded-xl border border-[#2B3240]',
              'bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5]',
              'placeholder:text-[#6E7482]',
              'focus:border-[#C8A06B] focus:outline-none',
            ].join(' ')}
          />
        </label>

        {/* ALL DAY TOGGLE */}

        <div
  className={[
    'flex min-h-[74px] items-center justify-between gap-4',
    'rounded-2xl border border-[#2B3240] bg-[#151922]',
    'px-4 py-4',
  ].join(' ')}
>
  <span className="min-w-0 flex-1 text-[14px] leading-5 text-[#F5F5F5]">
    Close shop for the entire day
  </span>

  <Switch
    checked={allDay}
    onChange={setAllDay}
    className={[
      'relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full',
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none',
      allDay
        ? 'bg-[#C8A06B]'
        : 'bg-[#2B3240]',
    ].join(' ')}
  >
    <span className="sr-only">
      Close shop for the entire day
    </span>

    <span
      aria-hidden="true"
      className={[
        'pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-[#F5F5F5]',
        'shadow-sm transition-transform duration-200 ease-in-out',
        allDay
          ? 'translate-x-[23px]'
          : 'translate-x-[3px]',
      ].join(' ')}
    />
  </Switch>
</div>

        {/* PARTIAL CLOSURE TIMES */}

        {!allDay && (
          <div className="flex items-end gap-3">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">
                From
              </span>

              <input
                type="time"
                value={
                  startTime
                }
                onChange={(
                  event
                ) =>
                  setStartTime(
                    event.target.value
                  )
                }
                className={[
                  'h-12 w-full rounded-xl border border-[#2B3240]',
                  'bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5]',
                  'focus:border-[#C8A06B] focus:outline-none',
                  '[color-scheme:dark]',
                ].join(' ')}
              />
            </label>

            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-[13px] text-[#A7AAB4]">
                To
              </span>

              <input
                type="time"
                value={
                  endTime
                }
                onChange={(
                  event
                ) =>
                  setEndTime(
                    event.target.value
                  )
                }
                className={[
                  'h-12 w-full rounded-xl border border-[#2B3240]',
                  'bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5]',
                  'focus:border-[#C8A06B] focus:outline-none',
                  '[color-scheme:dark]',
                ].join(' ')}
              />
            </label>
          </div>
        )}
      </div>
    </OwnerPageShell>
  );
}
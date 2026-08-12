import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  Switch,
} from '@headlessui/react';

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

/* ------------------------------------------------------------------
   TODAY — IST
------------------------------------------------------------------- */

function todayIST(): string {
  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Kolkata',
    }
  ).format(new Date());
}

/* ------------------------------------------------------------------
   SHARED INPUT STYLE
------------------------------------------------------------------- */

const inputClass = [
  'box-border block h-12',
  'w-full min-w-0 max-w-full',
  'rounded-xl border border-[#2B3240]',
  'bg-[#1C2230]',
  'px-3',
  'text-[15px] text-[#F5F5F5]',
  'focus:border-[#C8A06B]',
  'focus:outline-none',
  '[color-scheme:dark]',
].join(' ');

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
    Boolean(closureId);

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
     EDIT MODE
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
  }, [existing]);

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
          <div
            className="grid w-full min-w-0 gap-3"
            style={{
              gridTemplateColumns:
                'minmax(0, 1fr) minmax(0, 1fr)',
            }}
          >
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
      <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden">

        {/* ----------------------------------------------------------
            DATE
        ----------------------------------------------------------- */}

        <label className="block w-full min-w-0 max-w-full">
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
            className={inputClass}
            style={{
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              boxSizing:
                'border-box',
            }}
          />
        </label>

        {/* ----------------------------------------------------------
            REASON
        ----------------------------------------------------------- */}

        <label className="block w-full min-w-0 max-w-full">
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
              inputClass,
              'placeholder:text-[#6E7482]',
            ].join(' ')}
          />
        </label>

        {/* ----------------------------------------------------------
            ALL DAY
        ----------------------------------------------------------- */}

        <div
          className={[
            'flex w-full min-w-0 max-w-full',
            'min-h-[72px]',
            'items-center justify-between gap-4',
            'box-border',
            'rounded-2xl',
            'border border-[#2B3240]',
            'bg-[#151922]',
            'px-4 py-4',
          ].join(' ')}
        >
          <span
            className={[
              'min-w-0 flex-1',
              'text-[14px]',
              'leading-5',
              'text-[#F5F5F5]',
            ].join(' ')}
          >
            Close shop for the entire day
          </span>

          <Switch
            checked={
              allDay
            }
            onChange={
              setAllDay
            }
            className={[
              'relative inline-flex',
              'h-[28px] w-[48px]',
              'shrink-0',
              'cursor-pointer',
              'items-center',
              'rounded-full',
              'transition-colors',
              'duration-200',
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
                'pointer-events-none',
                'block',
                'h-[22px]',
                'w-[22px]',
                'rounded-full',
                'bg-[#F5F5F5]',
                'shadow-sm',
                'transition-transform',
                'duration-200',

                allDay
                  ? 'translate-x-[23px]'
                  : 'translate-x-[3px]',
              ].join(' ')}
            />
          </Switch>
        </div>

        {/* ----------------------------------------------------------
            PARTIAL CLOSURE
        ----------------------------------------------------------- */}

        {!allDay && (
          <div
            className="grid w-full min-w-0 max-w-full gap-3 overflow-hidden"
            style={{
              gridTemplateColumns:
                'minmax(0, 1fr) minmax(0, 1fr)',
            }}
          >

            {/* FROM */}

            <label className="block min-w-0 max-w-full overflow-hidden">
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
                className={inputClass}
                style={{
                  display:
                    'block',

                  width:
                    '100%',

                  minWidth:
                    0,

                  maxWidth:
                    '100%',

                  boxSizing:
                    'border-box',

                  WebkitAppearance:
                    'none',

                  appearance:
                    'none',
                }}
              />
            </label>

            {/* TO */}

            <label className="block min-w-0 max-w-full overflow-hidden">
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
                className={inputClass}
                style={{
                  display:
                    'block',

                  width:
                    '100%',

                  minWidth:
                    0,

                  maxWidth:
                    '100%',

                  boxSizing:
                    'border-box',

                  WebkitAppearance:
                    'none',

                  appearance:
                    'none',
                }}
              />
            </label>
          </div>
        )}
      </div>
    </OwnerPageShell>
  );
}

export default OwnerAddEditClosurePage;
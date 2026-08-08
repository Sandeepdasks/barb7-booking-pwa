import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { useWorkingHours } from '@/hooks/owner/useWorkingHours';
import { useSlotLocksForDate } from '@/hooks/owner/useSlotLocksForDate';

import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';

import {
  OwnerButton,
  StickyActionBar,
} from '@/components/owner/ui';

import {
  AppSelect,
  type AppSelectOption,
} from '@/components/owner/ui/AppSelect';

import { DatePickerField } from '@/components/owner/schedule/DatePickerField';

import {
  enumerateSubSlots,
  formatTime12h,
  generateValidStartTimes,
  todayIST,
  weekdayForDate,
} from '@/utils/scheduleTimeline';

import {
  createWalkInAppointment,
  convertBlockedSlotToOwnerBooking,
  SlotUnavailableError,
} from '@/services/owner/scheduleService';

import type { WorkingHoursDay } from '@/types/owner';

/* ------------------------------------------------------------------
   SERVICES
------------------------------------------------------------------- */

const SERVICES = [
  {
    serviceId: 'hair-cut',
    name: 'Hair Cut',
    durationMins: 30,
  },
  {
    serviceId: 'hair-cut-beard',
    name: 'Hair Cut + Beard',
    durationMins: 45,
  },
  {
    serviceId: 'beard-dressing',
    name: 'Beard Dressing',
    durationMins: 15,
  },
  {
    serviceId: 'facial',
    name: 'Facial',
    durationMins: 90,
  },
  {
    serviceId: 'face-clean-up',
    name: 'Face Clean Up',
    durationMins: 30,
  },
  {
    serviceId: 'd-tan',
    name: 'D-Tan',
    durationMins: 30,
  },
];

/* ------------------------------------------------------------------
   UNAVAILABLE LABELS
------------------------------------------------------------------- */

const UNAVAILABLE_LABEL: Record<
  'booked' | 'owner_blocked' | 'lunch_break' | 'past',
  string
> = {
  booked: 'Booked',
  owner_blocked: 'Blocked',
  lunch_break: 'Lunch Break',
  past: 'Past',
};

/* ------------------------------------------------------------------
   NAVIGATION STATE
------------------------------------------------------------------- */

interface ConvertingGroupState {
  prefillDate?: string;
  prefillTime?: string;

  convertingGroup?: {
    salonId: string;
    date: string;
    startTime: string;
    durationMins: number;
  };
}

/* ------------------------------------------------------------------
   WORKING HOURS COMPATIBILITY
------------------------------------------------------------------- */

type WorkingHoursDayCompat =
  WorkingHoursDay & {
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;

    start?: string;
    end?: string;
    closed?: boolean;
  };

function getWorkingHoursDayState(
  day: WorkingHoursDay | null
) {
  if (!day) {
    return {
      isClosed: false,
      openTime: null as string | null,
      closeTime: null as string | null,
    };
  }

  const compatible =
    day as WorkingHoursDayCompat;

  return {
    isClosed:
      compatible.isClosed ??
      compatible.closed ??
      false,

    openTime:
      compatible.openTime ??
      compatible.start ??
      null,

    closeTime:
      compatible.closeTime ??
      compatible.end ??
      null,
  };
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */

export function OwnerAddBookingPage() {
  const { ownerProfile } =
    useOwnerAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const navState =
    (location.state as ConvertingGroupState | null) ??
    null;

  /* --------------------------------------------------------------
     FORM STATE
  --------------------------------------------------------------- */

  const [date, setDate] =
    useState(
      navState?.prefillDate ??
        todayIST()
    );

  const [time, setTime] =
    useState(
      navState?.prefillTime ??
        ''
    );

  const [
    serviceId,
    setServiceId,
  ] = useState(
    SERVICES[0].serviceId
  );

  const [
    customerName,
    setCustomerName,
  ] = useState('');

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /* --------------------------------------------------------------
     FIRESTORE DATA
  --------------------------------------------------------------- */

  const {
    hours,
    loading:
      hoursLoading,
  } = useWorkingHours(
    ownerProfile?.salonId
  );

  const {
    slotLocks,
    loading:
      locksLoading,
  } = useSlotLocksForDate(
    ownerProfile?.salonId,
    date
  );

  /* --------------------------------------------------------------
     SELECTED SERVICE
  --------------------------------------------------------------- */

  const service =
    SERVICES.find(
      (item) =>
        item.serviceId ===
        serviceId
    ) ??
    SERVICES[0];

  /* --------------------------------------------------------------
     WORKING HOURS FOR SELECTED DATE
  --------------------------------------------------------------- */

  const weekday =
    weekdayForDate(date);

  const workingHoursDay =
    hours?.[weekday] ??
    null;

  const workingDayState =
    getWorkingHoursDayState(
      workingHoursDay
    );

  const isSalonClosed =
    workingDayState.isClosed;

  const workingDayHasValidTimes =
    !!workingDayState.openTime &&
    !!workingDayState.closeTime;

  /* --------------------------------------------------------------
     BLOCK → BOOKING CONVERSION
  --------------------------------------------------------------- */

  const isConverting =
    Boolean(
      navState?.convertingGroup &&
        date ===
          navState
            .convertingGroup
            .date
    );

  const excludeTimes =
    useMemo(() => {
      if (
        !isConverting ||
        !navState?.convertingGroup
      ) {
        return undefined;
      }

      return new Set(
        enumerateSubSlots(
          navState
            .convertingGroup
            .startTime,

          navState
            .convertingGroup
            .durationMins
        )
      );
    }, [
      isConverting,
      navState,
    ]);

  /* --------------------------------------------------------------
     TIME AVAILABILITY
  --------------------------------------------------------------- */

  const timeOptions =
    useMemo(() => {
      if (
        hoursLoading ||
        locksLoading ||
        !workingHoursDay
      ) {
        return [];
      }

      if (isSalonClosed) {
        return [];
      }

      if (
        !workingDayHasValidTimes
      ) {
        return [];
      }

      return generateValidStartTimes(
  workingHoursDay,
  service.durationMins,
  slotLocks ?? [],
  {
    breakStart:
      hours?.breakStart,

    breakEnd:
      hours?.breakEnd,

    excludeTimes,

    selectedDate: date,
  }
);
    }, [
      workingHoursDay,
      service.durationMins,
      slotLocks,
      hours?.breakStart,
      hours?.breakEnd,
      excludeTimes,
      hoursLoading,
      locksLoading,
      isSalonClosed,
      workingDayHasValidTimes,
    ]);

  /* --------------------------------------------------------------
     TIME SELECT OPTIONS
  --------------------------------------------------------------- */

  const selectOptions: AppSelectOption[] =
  useMemo(
    () =>
      timeOptions.map(
        (option) => ({
          value: option.time,

          label: formatTime12h(
            option.time
          ),

          disabled: !option.available,

          note: option.available
            ? undefined
            : UNAVAILABLE_LABEL[
                option.reason ??
                  'booked'
              ],
        })
      ),
    [timeOptions]
  );

  /* --------------------------------------------------------------
     CLEAR INVALID SELECTED TIME
  --------------------------------------------------------------- */

  useEffect(() => {
    if (!time) {
      return;
    }

    if (
      hoursLoading ||
      locksLoading
    ) {
      return;
    }

    const stillValid =
      timeOptions.some(
        (option) =>
          option.time ===
            time &&
          option.available
      );

    if (!stillValid) {
      setTime('');
    }
  }, [
    timeOptions,
    time,
    hoursLoading,
    locksLoading,
  ]);

  /* --------------------------------------------------------------
     CLEAR TIME WHEN DATE CHANGES
  --------------------------------------------------------------- */

  useEffect(() => {
    if (
      isConverting &&
      navState?.prefillTime
    ) {
      return;
    }

    setTime('');
  }, [
    date,
    isConverting,
    navState?.prefillTime,
  ]);

  /* --------------------------------------------------------------
     CLEAR INVALID TIME WHEN SERVICE CHANGES
  --------------------------------------------------------------- */

  useEffect(() => {
    if (!time) {
      return;
    }

    if (
      hoursLoading ||
      locksLoading
    ) {
      return;
    }

    const valid =
      timeOptions.some(
        (option) =>
          option.time ===
            time &&
          option.available
      );

    if (!valid) {
      setTime('');
    }
  }, [
    serviceId,
    time,
    timeOptions,
    hoursLoading,
    locksLoading,
  ]);

  /* --------------------------------------------------------------
     PHONE VALIDATION
  --------------------------------------------------------------- */

  const phoneValid =
    /^[6-9]\d{9}$/.test(
      customerPhone
    );

  /* --------------------------------------------------------------
     SAVE ENABLED
  --------------------------------------------------------------- */

  const canSave =
    Boolean(
      ownerProfile &&
        date &&
        time &&
        customerName.trim() &&
        phoneValid &&
        workingHoursDay &&
        !isSalonClosed &&
        workingDayHasValidTimes &&
        !hoursLoading &&
        !locksLoading
    );

  /* --------------------------------------------------------------
     SAVE
  --------------------------------------------------------------- */

  async function handleSave() {
    if (
      !ownerProfile ||
      !canSave
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (
        isConverting &&
        navState?.convertingGroup
      ) {
        await convertBlockedSlotToOwnerBooking(
          {
            group:
              navState.convertingGroup,

            booking: {
              time,

              serviceId:
                service.serviceId,

              serviceName:
                service.name,

              durationMins:
                service.durationMins,

              customerName:
                customerName.trim(),

              customerPhone,
            },

            ownerUid:
              ownerProfile.uid,
          }
        );
      } else {
        await createWalkInAppointment(
          {
            salonId:
              ownerProfile.salonId,

            date,

            time,

            serviceId:
              service.serviceId,

            serviceName:
              service.name,

            durationMins:
              service.durationMins,

            customerName:
              customerName.trim(),

            customerPhone,

            createdBy:
              ownerProfile.uid,
          }
        );
      }

      navigate(
        '/owner/schedule',
        {
          state: {
            date,
          },
        }
      );
    } catch (err) {
      if (
        err instanceof
        SlotUnavailableError
      ) {
        setError(
          'This time was just booked. Please choose another time.'
        );

        setTime('');
      } else {
        console.error(
          'Failed to save owner booking:',
          err
        );

        setError(
          'Could not save booking. Try again.'
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* --------------------------------------------------------------
     TIME FIELD STATE
  --------------------------------------------------------------- */

  const timePlaceholder =
    hoursLoading ||
    locksLoading
      ? 'Loading available times...'
      : 'Select a time';

  /* --------------------------------------------------------------
     UI
  --------------------------------------------------------------- */

  return (
    <OwnerPageShell
      header={
        <OwnerHeader
          title="Add Booking"
          onBack={() =>
            navigate(-1)
          }
        />
      }
      footer={
        <StickyActionBar>
          <OwnerButton
            variant="primary"
            fullWidth
            disabled={!canSave}
            loading={saving}
            onClick={handleSave}
          >
            Save Booking
          </OwnerButton>
        </StickyActionBar>
      }
    >
      <div className="flex flex-col gap-4">
        {isConverting && (
          <div className="rounded-xl border border-[#C8A06B]/40 bg-[#C8A06B]/10 px-3 py-2 text-[12px] leading-5 text-[#C8A06B]">
            Booking into a previously blocked time.
            The blocked period will be released and
            replaced by this booking.
          </div>
        )}

        {/* DATE */}

        <Field label="Date">
          <DatePickerField
            value={date}
            onChange={(nextDate) => {
              setError(null);
              setDate(nextDate);
            }}
            minDate={todayIST()}
          />
        </Field>

        {/* SERVICE */}

        <Field label="Service">
          <AppSelect
            value={serviceId}
            onChange={(nextServiceId) => {
              setError(null);

              setServiceId(
                nextServiceId
              );
            }}
            options={SERVICES.map(
              (item) => ({
                value:
                  item.serviceId,

                label:
                  `${item.name} · ${item.durationMins} min`,
              })
            )}
            placeholder="Select a service"
          />
        </Field>

        {/* TIME */}

        <Field label="Time">
          {isSalonClosed ? (
            <div className="flex min-h-12 items-center rounded-xl border border-dashed border-[#2B3240] px-3 text-[13px] text-[#6E7482]">
              Salon is closed on this date.
            </div>
          ) : (
            <AppSelect
              value={time}
              onChange={(nextTime) => {
                setError(null);
                setTime(nextTime);
              }}
              options={selectOptions}
              placeholder={
                timePlaceholder
              }
              disabled={
                hoursLoading ||
                locksLoading ||
                !workingHoursDay ||
                !workingDayHasValidTimes ||
                selectOptions.length ===
                  0
              }
            />
          )}

          {!hoursLoading &&
            !locksLoading &&
            workingHoursDay &&
            !isSalonClosed &&
            workingDayHasValidTimes &&
            selectOptions.length ===
              0 && (
              <p className="mt-1.5 text-[12px] text-[#6E7482]">
                No available times for this service on the selected date.
              </p>
            )}
        </Field>

        {/* CUSTOMER NAME */}

        <Field label="Customer Name">
          <input
            type="text"
            value={customerName}
            onChange={(event) => {
              setError(null);

              setCustomerName(
                event.target.value
              );
            }}
            placeholder="e.g. Rahul"
            autoComplete="name"
            className={inputClass}
          />
        </Field>

        {/* PHONE */}

        <Field label="Phone Number">
          <input
            type="tel"
            inputMode="numeric"
            value={customerPhone}
            onChange={(event) => {
              setError(null);

              setCustomerPhone(
                event.target.value
                  .replace(
                    /\D/g,
                    ''
                  )
                  .slice(
                    0,
                    10
                  )
              );
            }}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            className={inputClass}
          />

          {customerPhone &&
            !phoneValid && (
              <p className="mt-1.5 text-[12px] text-[#E5484D]">
                Enter a valid 10-digit mobile number.
              </p>
            )}
        </Field>

        {/* ERROR */}

        {error && (
          <p className="text-[13px] leading-5 text-[#E5484D]">
            {error}
          </p>
        )}
      </div>
    </OwnerPageShell>
  );
}

/* ------------------------------------------------------------------
   STYLES
------------------------------------------------------------------- */

const inputClass =
  'h-12 w-full rounded-xl border border-[#2B3240] bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5] placeholder:text-[#6E7482] focus:border-[#C8A06B] focus:outline-none';

/* ------------------------------------------------------------------
   FIELD
------------------------------------------------------------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="block w-full">
      <div className="mb-1.5 text-[13px] text-[#A7AAB4]">
        {label}
      </div>

      {children}
    </div>
  );
}
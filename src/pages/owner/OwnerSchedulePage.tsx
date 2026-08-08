import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useOwnerAuth,
} from '@/contexts/OwnerAuthContext';

import {
  useSchedule,
} from '@/hooks/owner/useSchedule';

import {
  useWorkingHours,
} from '@/hooks/owner/useWorkingHours';

import {
  useClosureForDate,
} from '@/hooks/useClosureForDate';

import {
  OwnerPageShell,
} from '@/components/owner/layout/OwnerPageShell';

import {
  OwnerHeader,
} from '@/components/owner/layout/OwnerHeader';

import {
  DateNavigator,
} from '@/components/owner/schedule/ScheduleParts';

import {
  CalendarTimeline,
} from '@/components/owner/schedule/CalendarTimeline';

import {
  BookingDetailsSheet,
} from '@/components/owner/booking/BookingDetailsSheet';

import {
  BlockedSlotDetailsSheet,
} from '@/components/owner/booking/BlockedSlotDetailsSheet';

import {
  CancelBlockModal,
} from '@/components/owner/booking/CancelBlockModal';

import {
  OwnerSpinner,
} from '@/components/owner/ui';

import {
  todayIST,
  weekdayForDate,
} from '@/utils/scheduleTimeline';

import {
  updateAppointmentStatus,
  cancelAndBlockAppointment,
  releaseBlockedGroup,
} from '@/services/owner/scheduleService';

import type {
  Appointment,
  BlockedEventGroup,
  SpecialClosure as OwnerSpecialClosure,
} from '@/types/owner';

/* ------------------------------------------------------------------
   DATE SHIFT
------------------------------------------------------------------- */

function shiftDate(
  date: string,
  days: number
): string {
  const [
    year,
    month,
    day,
  ] =
    date
      .split('-')
      .map(Number);

  const currentDate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  currentDate.setUTCDate(
    currentDate.getUTCDate() +
      days
  );

  return currentDate
    .toISOString()
    .slice(0, 10);
}

/* ------------------------------------------------------------------
   DATE LABEL
------------------------------------------------------------------- */

function formatScheduleDate(
  date: string
): string {
  const [
    year,
    month,
    day,
  ] =
    date
      .split('-')
      .map(Number);

  const value =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return value.toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    }
  );
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */

export function OwnerSchedulePage() {
  const {
    ownerProfile,
  } =
    useOwnerAuth();

  const navigate =
    useNavigate();

  const [
    date,
    setDate,
  ] =
    useState(
      todayIST()
    );

  /* ----------------------------------------------------------------
     SCHEDULE DATA
  ---------------------------------------------------------------- */

  const {
    appointments,
    blockedGroups,
    loading:
      scheduleLoading,
  } =
    useSchedule(
      ownerProfile?.salonId,
      date
    );

  /* ----------------------------------------------------------------
     WORKING HOURS
  ---------------------------------------------------------------- */

  const {
    hours,
    loading:
      workingHoursLoading,
  } =
    useWorkingHours(
      ownerProfile?.salonId
    );

  /* ----------------------------------------------------------------
     SPECIAL CLOSURES
  ---------------------------------------------------------------- */

  const {
    closures,
    loading:
      closureLoading,
  } =
    useClosureForDate(
      ownerProfile?.salonId ?? '',
      date
    );

  /*
   * Customer-side closure model:
   *
   * {
   *   id
   *   type: 'full_day' | 'partial_day'
   *   reason
   * }
   *
   * CalendarTimeline currently uses the owner-side model:
   *
   * {
   *   closureId
   *   allDay
   *   label
   * }
   *
   * Convert the full array here.
   */
  const ownerSpecialClosures:
    OwnerSpecialClosure[] =
    closures.map(
      (closure) => ({
        closureId:
          closure.id,

        salonId:
          closure.salonId,

        date:
          closure.date,

        label:
          closure.reason ??
          '',

        allDay:
          closure.type ===
          'full_day',

        startTime:
          closure.startTime,

        endTime:
          closure.endTime,

        createdAt:
          closure.createdAt,
      })
    );

  /* ----------------------------------------------------------------
     SELECTED ITEMS
  ---------------------------------------------------------------- */

  const [
    selectedAppt,
    setSelectedAppt,
  ] =
    useState<
      Appointment | null
    >(null);

  const [
    selectedGroup,
    setSelectedGroup,
  ] =
    useState<
      BlockedEventGroup | null
    >(null);

  const [
    confirmCancel,
    setConfirmCancel,
  ] =
    useState(false);

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  /* ----------------------------------------------------------------
     DERIVED DATE DATA
  ---------------------------------------------------------------- */

  const dateLabel =
    formatScheduleDate(
      date
    );

  const isToday =
    date ===
    todayIST();

  const weekday =
    weekdayForDate(
      date
    );

  const workingHoursDay =
    hours?.[
      weekday
    ] ??
    null;

  const loading =
    scheduleLoading ||
    workingHoursLoading ||
    closureLoading;

  /* ----------------------------------------------------------------
     APPOINTMENT ACTIONS
  ---------------------------------------------------------------- */

  async function handleMarkCompleted() {
    if (!selectedAppt) {
      return;
    }

    setBusy(true);

    try {
      await updateAppointmentStatus(
        selectedAppt.appointmentId,
        'completed'
      );

      setSelectedAppt(
        null
      );
    } finally {
      setBusy(false);
    }
  }

  /* ----------------------------------------------------------------
     CANCEL + BLOCK
  ---------------------------------------------------------------- */

  async function handleConfirmCancelAndBlock() {
    if (
      !selectedAppt ||
      !ownerProfile
    ) {
      return;
    }

    setBusy(true);

    try {
      await cancelAndBlockAppointment(
        selectedAppt,
        ownerProfile.uid
      );

      setConfirmCancel(
        false
      );

      setSelectedAppt(
        null
      );
    } finally {
      setBusy(false);
    }
  }

  /* ----------------------------------------------------------------
     RELEASE OWNER BLOCK
  ---------------------------------------------------------------- */

  async function handleRelease() {
    if (!selectedGroup) {
      return;
    }

    setBusy(true);

    try {
      await releaseBlockedGroup(
        selectedGroup
      );

      setSelectedGroup(
        null
      );
    } finally {
      setBusy(false);
    }
  }

  /* ----------------------------------------------------------------
     OWNER BLOCK → BOOKING
  ---------------------------------------------------------------- */

  function handleAddBookingFromBlocked() {
    if (!selectedGroup) {
      return;
    }

    navigate(
      '/owner/bookings/new',
      {
        state: {
          prefillDate:
            selectedGroup.date,

          prefillTime:
            selectedGroup.startTime,

          convertingGroup: {
            salonId:
              selectedGroup.salonId,

            date:
              selectedGroup.date,

            startTime:
              selectedGroup.startTime,

            durationMins:
              selectedGroup.durationMins,
          },
        },
      }
    );
  }

  /* ----------------------------------------------------------------
     UI
  ---------------------------------------------------------------- */

  return (
    <OwnerPageShell
      header={
        <OwnerHeader
          title="Today"
          subtitle={
            dateLabel
          }
          onBack={() =>
            navigate(-1)
          }
        />
      }
    >
      <DateNavigator
        label={
          dateLabel
        }
        onPrev={() =>
          setDate(
            (
              current
            ) =>
              shiftDate(
                current,
                -1
              )
          )
        }
        onNext={() =>
          setDate(
            (
              current
            ) =>
              shiftDate(
                current,
                1
              )
          )
        }
      />

      {loading ||
      !workingHoursDay ? (
        <OwnerSpinner />
      ) : (
        <CalendarTimeline
          workingHoursDay={
            workingHoursDay
          }

          breakStart={
            hours?.breakStart
          }

          breakEnd={
            hours?.breakEnd
          }

          appointments={
            appointments
          }

          blockedGroups={
            blockedGroups
          }

          /*
           * IMPORTANT:
           * CalendarTimeline must now accept an ARRAY.
           */
          specialClosures={
            ownerSpecialClosures
          }

          isToday={
            isToday
          }

          onSelectAppointment={
            setSelectedAppt
          }

          onSelectBlockedGroup={
            setSelectedGroup
          }
        />
      )}

      {/* ------------------------------------------------------------
          APPOINTMENT DETAILS
      ------------------------------------------------------------- */}

      <BookingDetailsSheet
        appointment={
          selectedAppt
        }
        open={
          !!selectedAppt
        }
        onClose={() =>
          setSelectedAppt(
            null
          )
        }
        onMarkCompleted={
          handleMarkCompleted
        }
        onCancelAndBlock={() =>
          setConfirmCancel(
            true
          )
        }
        updating={
          busy
        }
      />

      {/* ------------------------------------------------------------
          CANCEL + BLOCK
      ------------------------------------------------------------- */}

      <CancelBlockModal
        open={
          confirmCancel
        }
        confirming={
          busy
        }
        onConfirm={
          handleConfirmCancelAndBlock
        }
        onCancel={() =>
          setConfirmCancel(
            false
          )
        }
      />

      {/* ------------------------------------------------------------
          OWNER BLOCK DETAILS
      ------------------------------------------------------------- */}

      <BlockedSlotDetailsSheet
        group={
          selectedGroup
        }
        open={
          !!selectedGroup
        }
        onClose={() =>
          setSelectedGroup(
            null
          )
        }
        onRelease={
          handleRelease
        }
        onAddBooking={
          handleAddBookingFromBlocked
        }
        releasing={
          busy
        }
      />
    </OwnerPageShell>
  );
}
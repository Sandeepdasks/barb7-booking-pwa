import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { useSchedule } from '@/hooks/owner/useSchedule';
import { useWorkingHours } from '@/hooks/owner/useWorkingHours';

import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';
import { DateNavigator } from '@/components/owner/schedule/ScheduleParts';
import { CalendarTimeline } from '@/components/owner/schedule/CalendarTimeline';

import { BookingDetailsSheet } from '@/components/owner/booking/BookingDetailsSheet';
import { BlockedSlotDetailsSheet } from '@/components/owner/booking/BlockedSlotDetailsSheet';
import { CancelBlockModal } from '@/components/owner/booking/CancelBlockModal';

import { OwnerSpinner } from '@/components/owner/ui';

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
} from '@/types/owner';

/* ------------------------------------------------------------------
   DATE SHIFT
------------------------------------------------------------------- */

/**
 * UTC-safe date movement.
 *
 * Prevents:
 * - left arrow jumping 2 days
 * - right arrow appearing not to work
 * - IST / UTC date shifting
 */
function shiftDate(
  date: string,
  days: number
): string {
  const [year, month, day] =
    date.split('-').map(Number);

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

function formatDateLabel(
  date: string
): string {
  const [year, month, day] =
    date.split('-').map(Number);

  const value = new Date(
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
  const { ownerProfile } =
    useOwnerAuth();

  const navigate =
    useNavigate();

  const [date, setDate] =
    useState(todayIST());

  const {
    appointments,
    blockedGroups,
    loading,
  } = useSchedule(
    ownerProfile?.salonId,
    date
  );

  const {
    hours,
    loading: hoursLoading,
  } = useWorkingHours(
    ownerProfile?.salonId
  );

  const [
    selectedAppt,
    setSelectedAppt,
  ] =
    useState<Appointment | null>(
      null
    );

  const [
    selectedGroup,
    setSelectedGroup,
  ] =
    useState<BlockedEventGroup | null>(
      null
    );

  const [
    confirmCancel,
    setConfirmCancel,
  ] =
    useState(false);

  const [busy, setBusy] =
    useState(false);

  const dateLabel =
    formatDateLabel(date);

  const isToday =
    date === todayIST();

  const weekday =
    weekdayForDate(date);

  const workingHoursDay =
    hours?.[weekday] ??
    null;

  /* ----------------------------------------------------------------
     MARK COMPLETED
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

      setSelectedAppt(null);
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

      /*
       * Stay on the exact same date.
       */
      setConfirmCancel(false);
      setSelectedAppt(null);
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

      setSelectedGroup(null);
    } finally {
      setBusy(false);
    }
  }

  /* ----------------------------------------------------------------
     ADD BOOKING FROM BLOCK
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
          subtitle={dateLabel}
          onBack={() =>
            navigate(
              '/owner.html'
            )
          }
        />
      }
    >
      {/*
       * Prevent the entire schedule page from becoming
       * the scroll container.
       */}
      <div className="flex min-h-0 flex-col">
        {/* DATE NAVIGATION */}

        <div className="shrink-0">
          <DateNavigator
            label={dateLabel}
            onPrev={() =>
              setDate(
                (currentDate) =>
                  shiftDate(
                    currentDate,
                    -1
                  )
              )
            }
            onNext={() =>
              setDate(
                (currentDate) =>
                  shiftDate(
                    currentDate,
                    1
                  )
              )
            }
          />
        </div>

        {/* CALENDAR */}

        {loading ||
        hoursLoading ||
        !workingHoursDay ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <OwnerSpinner />
          </div>
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
            isToday={isToday}
            onSelectAppointment={
              setSelectedAppt
            }
            onSelectBlockedGroup={
              setSelectedGroup
            }
          />
        )}
      </div>

      {/* APPOINTMENT DETAILS */}

      <BookingDetailsSheet
        appointment={
          selectedAppt
        }
        open={!!selectedAppt}
        onClose={() =>
          setSelectedAppt(null)
        }
        onMarkCompleted={
          handleMarkCompleted
        }
        onCancelAndBlock={() =>
          setConfirmCancel(true)
        }
        updating={busy}
      />

      {/* CANCEL CONFIRMATION */}

      <CancelBlockModal
        open={confirmCancel}
        confirming={busy}
        onConfirm={
          handleConfirmCancelAndBlock
        }
        onCancel={() =>
          setConfirmCancel(false)
        }
      />

      {/* OWNER BLOCK DETAILS */}

      <BlockedSlotDetailsSheet
        group={selectedGroup}
        open={!!selectedGroup}
        onClose={() =>
          setSelectedGroup(null)
        }
        onRelease={
          handleRelease
        }
        onAddBooking={
          handleAddBookingFromBlocked
        }
        releasing={busy}
      />
    </OwnerPageShell>
  );
}
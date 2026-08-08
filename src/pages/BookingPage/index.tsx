import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
} from "lucide-react";

import {
  DateTabs,
} from "../../components/Booking/DateTabs";

import {
  ServiceSelector,
} from "../../components/Booking/ServiceSelector";

import {
  SessionSection,
} from "../../components/Booking/SessionSection";

import {
  StickyContinueCTA,
} from "../../components/Booking/StickyContinueCTA";

import {
  ContactDetailsModal,
  type ContactDetailsSubmitPayload,
} from "../../components/Booking/ContactDetailsModal";

import {
  ReviewBookingModal,
} from "../../components/Booking/ReviewBookingModal";

import {
  useBookingAuthGate,
} from "../../components/Booking/BookingAuthGate";

import {
  ResponsiveContainer,
} from "../../components/layout/ResponsiveContainer";

import {
  getBookableDays,
  type BookableDayKey,
  formatDisplayDate,
} from "../../utils/dateUtils";

import {
  to12h,
} from "../../utils/slotGenerator";

import {
  getTotalDurationMinutes,
} from "../../utils/serviceDurationEngine";

import {
  buildSessionSlots,
  isSlotSelectable,
} from "../../utils/bookingAvailability";

import {
  useDateAvailability,
} from "../../hooks/useDateAvailability";

import {
  useSalonWorkingHours,
} from "../../hooks/useSalonWorkingHours";

import {
  useClosureForDate,
} from "../../hooks/useClosureForDate";

import {
  mockSalonProfile,
} from "../../services/mockSalonService";

import {
  createBooking,
  SlotTakenError,
} from "../../services/bookingService";

import type {
  SessionKey,
} from "../../types/workingHours";

import type {
  DayKey,
} from "../../types/workingHours.types";

import type {
  BookedService,
} from "../../types/bookingRecord";

import {
  useAuth,
} from "../../contexts/AuthContext";

/* ------------------------------------------------------------------
   SESSION LABELS
------------------------------------------------------------------- */

const SESSION_LABELS: Record<
  SessionKey,
  string
> = {
  morning: "Morning",
  evening: "Evening",
};

/* ------------------------------------------------------------------
   MODAL
------------------------------------------------------------------- */

type ModalStage =
  | "none"
  | "contact"
  | "review";

/* ------------------------------------------------------------------
   IST CURRENT TIME
------------------------------------------------------------------- */

function currentMinutesIST(): number {
  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone:
          "Asia/Kolkata",
        hour:
          "2-digit",
        minute:
          "2-digit",
        hourCycle:
          "h23",
      }
    ).formatToParts(
      new Date()
    );

  const hour =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "hour"
      )?.value ?? "0"
    );

  const minute =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "minute"
      )?.value ?? "0"
    );

  return (
    hour * 60 +
    minute
  );
}

/* ------------------------------------------------------------------
   BOOKING PAGE
------------------------------------------------------------------- */

export function BookingPage() {
  const navigate =
    useNavigate();

  const days =
    useMemo(
      () =>
        getBookableDays(),
      []
    );

  const [
    activeKey,
    setActiveKey,
  ] =
    useState<BookableDayKey>(
      days[0].key
    );

  const [
    selectedServiceIds,
    setSelectedServiceIds,
  ] =
    useState<string[]>([]);

  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState<
      string | undefined
    >();

  const [
    slotLostMessage,
    setSlotLostMessage,
  ] =
    useState<
      string | null
    >(null);

  const {
    user,
    loading:
      authLoading,
  } =
    useAuth();

  const {
    status:
      authStatus,

    errorMessage:
      authError,

    ensureAuthenticated,
  } =
    useBookingAuthGate();

  const [
    modalStage,
    setModalStage,
  ] =
    useState<ModalStage>(
      "none"
    );

  const [
    pendingContact,
    setPendingContact,
  ] =
    useState<
      ContactDetailsSubmitPayload | null
    >(null);

  const [
    submitting,
  ] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] =
    useState<
      string | null
    >(null);

  /* ----------------------------------------------------------------
     ACTIVE DATE
  ---------------------------------------------------------------- */

  const activeDay =
    days.find(
      (day) =>
        day.key ===
        activeKey
    )!;

  /* ----------------------------------------------------------------
     LIVE WORKING HOURS
  ---------------------------------------------------------------- */

  const {
    workingHours,
    loading:
      workingHoursLoading,
    error:
      workingHoursError,
  } =
    useSalonWorkingHours(
      mockSalonProfile.salonId
    );

  const activeWeekday =
    activeDay.weekday as DayKey;

  const dayConfig =
    workingHours?.[
      activeWeekday
    ] ?? null;

  const baseSlotIntervalMinutes =
    workingHours
      ?.slotIntervalMinutes ??
    15;

  /* ----------------------------------------------------------------
     LIVE SPECIAL CLOSURE
  ---------------------------------------------------------------- */

  const {
    closures,
    loading:
      closureLoading,
  } =
    useClosureForDate(
      mockSalonProfile.salonId,
      activeDay.dateKey
    );

  /*
   * Partial Special Closures are converted into
   * blocked 15-minute times for the existing
   * booking availability engine.
   *
   * Example:
   *
   * closure:
   * 09:30 → 14:00
   *
   * blocked:
   * 09:30
   * 09:45
   * 10:00
   * ...
   * 13:45
   *
   * 14:00 remains available.
   */
  const closureBlockedSlots =
  useMemo(() => {
    const blocked =
      new Set<string>();

    for (const closure of closures) {
      if (
        closure.type ===
          "full_day" ||
        !closure.startTime ||
        !closure.endTime
      ) {
        continue;
      }

      const [
        startHour,
        startMinute,
      ] =
        closure.startTime
          .split(":")
          .map(Number);

      const [
        endHour,
        endMinute,
      ] =
        closure.endTime
          .split(":")
          .map(Number);

      const start =
        startHour * 60 +
        startMinute;

      const end =
        endHour * 60 +
        endMinute;

      if (
        !Number.isFinite(
          start
        ) ||
        !Number.isFinite(
          end
        ) ||
        end <= start
      ) {
        continue;
      }

      for (
        let minute = start;
        minute < end;
        minute +=
          baseSlotIntervalMinutes
      ) {
        const hour =
          Math.floor(
            minute / 60
          );

        const mins =
          minute % 60;

        blocked.add(
          `${String(
            hour
          ).padStart(
            2,
            "0"
          )}:${String(
            mins
          ).padStart(
            2,
            "0"
          )}`
        );
      }
    }

    return blocked;
  }, [
    closures,
    baseSlotIntervalMinutes,
  ]);

  const fullDayClosure =
  useMemo(
    () =>
      closures.find(
        (closure) =>
          closure.type ===
          "full_day"
      ) ?? null,
    [closures]
  );

  /* ----------------------------------------------------------------
     LIVE BOOKED / BLOCKED SLOT LOCKS
  ---------------------------------------------------------------- */

  const {
    occupiedSlots,
    loading:
      availabilityLoading,
    error:
      availabilityError,
  } =
    useDateAvailability(
      mockSalonProfile.salonId,
      activeDay.dateKey
    );

  /* ----------------------------------------------------------------
     SERVICES
  ---------------------------------------------------------------- */

  const selectedServices:
    BookedService[] =
    useMemo(
      () =>
        mockSalonProfile.services
          .filter(
            (service) =>
              selectedServiceIds.includes(
                service.id
              )
          )
          .map(
            (service) => ({
              serviceId:
                service.id,

              serviceName:
                service.name,

              durationMinutes:
                service.durationMinutes,
            })
          ),
      [
        selectedServiceIds,
      ]
    );

  const totalDurationMinutes =
    useMemo(
      () =>
        getTotalDurationMinutes(
          mockSalonProfile.services.filter(
            (service) =>
              selectedServiceIds.includes(
                service.id
              )
          )
        ),
      [
        selectedServiceIds,
      ]
    );

  /* ----------------------------------------------------------------
     TODAY / CURRENT TIME
  ---------------------------------------------------------------- */

  const isToday =
    activeDay.key ===
    "today";

  const nowMinutes =
    currentMinutesIST();

  /* ----------------------------------------------------------------
     DISPLAY LABELS
  ---------------------------------------------------------------- */

  const dateLabel =
    formatDisplayDate(
      activeDay.dateKey
    );

  const timeLabel =
    selectedTime
      ? to12h(
          selectedTime
        )
      : "";

  const servicesLabel =
    selectedServices
      .map(
        (service) =>
          service.serviceName
      )
      .join(", ");

  /* ----------------------------------------------------------------
     DATE CHANGE
  ---------------------------------------------------------------- */

  const handleDateChange = (
    key: BookableDayKey
  ) => {
    setActiveKey(key);

    setSelectedTime(
      undefined
    );

    setSubmitError(null);

    setSlotLostMessage(
      null
    );
  };

  /* ----------------------------------------------------------------
     SERVICE CHANGE
  ---------------------------------------------------------------- */

  const handleServiceToggle = (
    serviceId: string
  ) => {
    setSelectedServiceIds(
      (previous) =>
        previous.includes(
          serviceId
        )
          ? previous.filter(
              (id) =>
                id !==
                serviceId
            )
          : [
              ...previous,
              serviceId,
            ]
    );

    /*
     * Service duration changes which
     * starting slots remain valid.
     */
    setSelectedTime(
      undefined
    );

    setSubmitError(null);

    setSlotLostMessage(
      null
    );
  };

  /* ----------------------------------------------------------------
     SESSION / SLOT GENERATION
  ---------------------------------------------------------------- */

  const sessionSlots =
    useMemo(() => {
      if (
        !workingHours ||
        !dayConfig ||
        dayConfig.isClosed ||
        !!fullDayClosure
      ) {
        return [];
      }

      const openTime =
        dayConfig.openTime;

      const closeTime =
        dayConfig.closeTime;

      if (
        !openTime ||
        !closeTime
      ) {
        return [];
      }

      const lunchStart =
        workingHours
          .lunchBreak
          ?.start;

      const lunchEnd =
        workingHours
          .lunchBreak
          ?.end;

      const sessions: {
        key: SessionKey;
        start: string;
        end: string;
      }[] = [];

      /*
       * MORNING:
       *
       * opening → lunch start
       */
      if (
        lunchStart &&
        openTime <
          lunchStart &&
        lunchStart <=
          closeTime
      ) {
        sessions.push({
          key:
            "morning",

          start:
            openTime,

          end:
            lunchStart,
        });
      }

      /*
       * EVENING:
       *
       * lunch end → closing
       */
      if (
        lunchEnd &&
        lunchEnd <
          closeTime &&
        lunchEnd >=
          openTime
      ) {
        sessions.push({
          key:
            "evening",

          start:
            lunchEnd,

          end:
            closeTime,
        });
      }

      /*
       * No valid lunch break:
       * use entire opening period.
       */
      if (
        sessions.length ===
        0
      ) {
        sessions.push({
          key:
            "morning",

          start:
            openTime,

          end:
            closeTime,
        });
      }

      return sessions.map(
        ({
          key,
          start,
          end,
        }) => ({
          key,

          slots:
            buildSessionSlots(
              {
                session: {
                  start,
                  end,
                },

                baseSlotIntervalMinutes,

                totalDurationMinutes,

                occupiedSlots,

                /*
                 * Special Closure occupancy.
                 */
                blockedSlots:
                  closureBlockedSlots,

                isToday,

                nowMinutes,
              }
            ),
        })
      );
    }, [
      workingHours,
      dayConfig,
      fullDayClosure,
      closureBlockedSlots,
      baseSlotIntervalMinutes,
      totalDurationMinutes,
      occupiedSlots,
      isToday,
      nowMinutes,
    ]);

  /* ----------------------------------------------------------------
     SELECTED SLOT VALIDATION
  ---------------------------------------------------------------- */

  const selectedSlotStillValid =
    useMemo(() => {
      if (!selectedTime) {
        return false;
      }

      return sessionSlots.some(
        (session) =>
          session.slots.some(
            (slot) =>
              slot.time24 ===
                selectedTime &&
              isSlotSelectable(
                slot
              )
          )
      );
    }, [
      selectedTime,
      sessionSlots,
    ]);

  /* ----------------------------------------------------------------
     REAL-TIME SLOT LOSS
  ---------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedTime) {
      return;
    }

    if (
      selectedSlotStillValid
    ) {
      return;
    }

    setSlotLostMessage(
      "That time is no longer available. Please choose another."
    );

    setSelectedTime(
      undefined
    );

    if (
      modalStage !==
      "none"
    ) {
      setModalStage(
        "none"
      );

      setPendingContact(
        null
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSlotStillValid,
  ]);

  /* ----------------------------------------------------------------
     AUTH CROSS-TAB
  ---------------------------------------------------------------- */

  const wasAuthenticatedRef =
    useRef(false);

  useEffect(() => {
    if (user) {
      wasAuthenticatedRef.current =
        true;

      return;
    }

    if (
      wasAuthenticatedRef.current &&
      modalStage !==
        "none"
    ) {
      setModalStage(
        "none"
      );

      setPendingContact(
        null
      );

      setSubmitError(
        "You've been signed out. Please sign in again to continue booking."
      );
    }

    wasAuthenticatedRef.current =
      false;
  }, [
    user,
    modalStage,
  ]);

  /* ----------------------------------------------------------------
     CONTINUE
  ---------------------------------------------------------------- */

  const canContinue =
    selectedServiceIds.length >
      0 &&
    selectedSlotStillValid &&
    !availabilityLoading &&
    !workingHoursLoading &&
    !closureLoading &&
    !authLoading;

  const handleContinueClick =
    async () => {
      if (!canContinue) {
        return;
      }

      const authenticated =
        await ensureAuthenticated();

      if (!authenticated) {
        return;
      }

      setSlotLostMessage(
        null
      );

      setModalStage(
        "contact"
      );
    };

  /* ----------------------------------------------------------------
     CONTACT DETAILS
  ---------------------------------------------------------------- */

  const handleContactReview = (
    payload:
      ContactDetailsSubmitPayload
  ) => {
    setPendingContact(
      payload
    );

    setSubmitError(
      null
    );

    setModalStage(
      "review"
    );
  };

  /* ----------------------------------------------------------------
     BOOKING END TIME
  ---------------------------------------------------------------- */

  const bookingEndTime =
    useMemo(() => {
      if (!selectedTime) {
        return "";
      }

      const [
        hours,
        minutes,
      ] =
        selectedTime
          .split(":")
          .map(Number);

      const total =
        hours * 60 +
        minutes +
        totalDurationMinutes;

      const endHours =
        Math.floor(
          total / 60
        );

      const endMinutes =
        total % 60;

      return `${String(
        endHours
      ).padStart(
        2,
        "0"
      )}:${String(
        endMinutes
      ).padStart(
        2,
        "0"
      )}`;
    }, [
      selectedTime,
      totalDurationMinutes,
    ]);

  /* ----------------------------------------------------------------
     CONFIRM BOOKING
  ---------------------------------------------------------------- */

  const handleConfirmBooking =
    async () => {
      if (
        !pendingContact ||
        !selectedTime ||
        !user
      ) {
        return;
      }

      try {
        const booking =
          await createBooking(
            {
              salonId:
                mockSalonProfile.salonId,

              salonName:
                mockSalonProfile.name,

              customerId:
                user.uid,

              customerName:
                pendingContact.customerName,

              customerEmail:
                user.email ??
                null,

              customerPhone:
                pendingContact.customerPhone,

              services:
                selectedServices.map(
                  (
                    service
                  ) => ({
                    serviceId:
                      service.serviceId,

                    serviceName:
                      service.serviceName,

                    durationMinutes:
                      service.durationMinutes,
                  })
                ),

              totalDurationMinutes,

              appointmentDate:
                activeDay.dateKey,

              appointmentTime:
                selectedTime,

              appointmentEndTime:
                bookingEndTime,

              baseSlotIntervalMinutes,
            }
          );

        setModalStage(
          "none"
        );

        setPendingContact(
          null
        );

        navigate(
          "/booking-confirmed",
          {
            state:
              booking,
          }
        );
      } catch (err) {
        if (
          err instanceof
          SlotTakenError
        ) {
          setSubmitError(
            err.message
          );

          setSelectedTime(
            undefined
          );

          setModalStage(
            "none"
          );
        } else {
          console.error(
            "Booking creation failed:",
            err
          );

          setSubmitError(
            "Something went wrong creating your booking. Please try again."
          );
        }
      }
    };

  /* ----------------------------------------------------------------
     UI
  ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#1F2128] pb-28">
      <ResponsiveContainer>
        <header className="pt-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm font-medium text-[#B8BCC8]"
            aria-label="Go back to salon"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <p className="mt-4 text-[0.75rem] leading-[1.4rem] font-medium uppercase tracking-wide text-[#B8BCC8]">
            BARB7 UNISEX SALON
          </p>

          <h1 className="mt-1 text-xl font-bold text-[#F5F1EA]">
            Book Appointment
          </h1>
        </header>

        <DateTabs
          days={days}
          activeKey={
            activeKey
          }
          onChange={
            handleDateChange
          }
        />

        <div className="pt-2">
          {/* LOADING */}

          {workingHoursLoading ||
          closureLoading ? (
            <p className="mt-6 text-sm text-[#B8BCC8]">
              Loading availability...
            </p>
          ) : !dayConfig ? (
            /* MISSING WORKING HOURS */

            <p className="mt-6 text-sm text-red-400">
              Working hours are not available.
            </p>
          ) : dayConfig.isClosed ||
              !!fullDayClosure ? (
            /* FULL DAY CLOSED */

            <div className="mt-6">
              <p className="text-sm text-[#B8BCC8]">
                Salon is closed on{" "}
                {activeDay.monthShort}{" "}
                {activeDay.dayNum}.
              </p>

              {fullDayClosure?.reason && (
  <p className="mt-1 text-[12px] text-[#7F8491]">
    {fullDayClosure.reason}
  </p>
)}
            </div>
          ) : (
            <>
              {/* SERVICES */}

              <ServiceSelector
                services={
                  mockSalonProfile.services
                }
                selectedIds={
                  selectedServiceIds
                }
                totalDurationMinutes={
                  totalDurationMinutes
                }
                onToggle={
                  handleServiceToggle
                }
              />

              {/* SLOTS */}

              {selectedServiceIds.length ===
              0 ? (
                <p className="mt-2 text-sm text-[#B8BCC8]">
                  Select at least one service to see available times.
                </p>
              ) : availabilityLoading ? (
                <p className="mt-4 text-sm text-[#B8BCC8]">
                  Loading available time slots...
                </p>
              ) : (
                sessionSlots.map(
                  ({
                    key,
                    slots,
                  }) => (
                    <SessionSection
                      key={
                        key
                      }
                      title={
                        SESSION_LABELS[
                          key
                        ]
                      }
                      slots={
                        slots
                      }
                      selectedTime={
                        selectedTime
                      }
                      onSelect={(
                        time24
                      ) => {
                        setSelectedTime(
                          time24
                        );

                        setSubmitError(
                          null
                        );

                        setSlotLostMessage(
                          null
                        );
                      }}
                    />
                  )
                )
              )}
            </>
          )}

          {/* ERRORS / STATUS */}

          <div aria-live="polite">
            {workingHoursError && (
              <p className="mt-2 text-[0.75rem] leading-[1.4rem] text-red-400">
                {
                  workingHoursError
                }
              </p>
            )}

            {slotLostMessage && (
              <p className="mt-2 text-[0.75rem] leading-[1.4rem] text-red-400">
                {
                  slotLostMessage
                }
              </p>
            )}

            {availabilityError && (
              <p className="mt-2 text-[0.75rem] leading-[1.4rem] text-red-400">
                {
                  availabilityError
                }
              </p>
            )}

            {submitError &&
              ![
                "contact",
                "review",
              ].includes(
                modalStage
              ) && (
                <div className="mt-2">
                  <p className="text-[0.75rem] leading-[1.4rem] text-red-400">
                    {
                      submitError
                    }
                  </p>
                </div>
              )}

            {authStatus ===
              "error" &&
              authError && (
                <p className="mt-2 text-[0.75rem] leading-[1.4rem] text-red-400">
                  {
                    authError
                  }
                </p>
              )}
          </div>
        </div>
      </ResponsiveContainer>

      {/* CONTINUE */}

      <StickyContinueCTA
        enabled={
          canContinue
        }
        loading={
          authStatus ===
          "authenticating"
        }
        onContinue={
          handleContinueClick
        }
      />

      {/* CONTACT */}

      <ContactDetailsModal
        open={
          modalStage ===
          "contact"
        }
        defaultName={
          user?.name ??
          ""
        }
        email={
          user?.email ??
          null
        }
        salonName={
          mockSalonProfile.name
        }
        dateLabel={
          dateLabel
        }
        timeLabel={
          timeLabel
        }
        servicesLabel={
          servicesLabel
        }
        onClose={() =>
          setModalStage(
            "none"
          )
        }
        onSubmit={
          handleContactReview
        }
      />

      {/* REVIEW */}

      <ReviewBookingModal
        open={
          modalStage ===
          "review"
        }
        salonName={
          mockSalonProfile.name
        }
        dateLabel={
          dateLabel
        }
        timeLabel={
          timeLabel
        }
        email={
          user?.email ??
          null
        }
        services={
          selectedServices
        }
        contact={
          pendingContact
        }
        submitting={
          submitting
        }
        errorMessage={
          submitError
        }
        onClose={() =>
          setModalStage(
            "none"
          )
        }
        onConfirm={
          handleConfirmBooking
        }
      />
    </div>
  );
}
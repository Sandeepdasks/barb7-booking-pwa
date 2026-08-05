import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DateTabs } from "../../components/Booking/DateTabs";
import { ServiceSelector } from "../../components/Booking/ServiceSelector";
import { SessionSection } from "../../components/Booking/SessionSection";
import { StickyContinueCTA } from "../../components/Booking/StickyContinueCTA";
import { ContactDetailsModal, ContactDetailsSubmitPayload } from "../../components/Booking/ContactDetailsModal";
import { ReviewBookingModal } from "../../components/Booking/ReviewBookingModal";
import { useBookingAuthGate } from "../../components/Booking/BookingAuthGate";
import { ResponsiveContainer } from "../../components/layout/ResponsiveContainer";
import { getBookableDays, BookableDayKey, formatDisplayDate } from "../../utils/dateUtils";
import { to12h } from "../../utils/slotGenerator";
import { getTotalDurationMinutes } from "../../utils/serviceDurationEngine";
import { buildSessionSlots, isSlotSelectable } from "../../utils/bookingAvailability";
import { useDateAvailability } from "../../hooks/useDateAvailability";
import { mockWorkingHoursConfig } from "../../services/mockWorkingHoursConfig";
import { mockSalonProfile } from "../../services/mockSalonService";
import { createBooking, SlotTakenError } from "../../services/bookingService";
import { SessionKey } from "../../types/workingHours";
import { BookedService } from "../../types/bookingRecord";
// ASSUMPTION (see BookingAuthGate.tsx) — adjust path if your AuthContext differs.
import { useAuth } from "../../contexts/AuthContext";

// Afternoon removed: the salon's midday gap (2:00 PM–3:30 PM) is a lunch
// break, not a bookable session — see services/mockWorkingHoursConfig.ts.
const SESSION_ORDER: SessionKey[] = ["morning", "evening"];
const SESSION_LABELS: Record<SessionKey, string> = {
  morning: "Morning",
  evening: "Evening",
};

type ModalStage = "none" | "contact" | "review";

export function BookingPage() {
  const navigate = useNavigate();
  const days = useMemo(() => getBookableDays(), []);
  const [activeKey, setActiveKey] = useState<BookableDayKey>(days[0].key);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [slotLostMessage, setSlotLostMessage] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { status: authStatus, errorMessage: authError, ensureAuthenticated } = useBookingAuthGate();
  const [modalStage, setModalStage] = useState<ModalStage>("none");
  const [pendingContact, setPendingContact] = useState<ContactDetailsSubmitPayload | null>(null);
  const [submitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  

  const activeDay = days.find((d) => d.key === activeKey)!;
  const dayConfig = mockWorkingHoursConfig[activeDay.weekday];
  const baseSlotIntervalMinutes = mockWorkingHoursConfig.baseSlotIntervalMinutes;

  // Live availability, PII-free (see bookingService.ts) — updates instantly
  // across tabs/devices, survives refresh (Firestore-backed, not memory).
  const { occupiedSlots, loading: availabilityLoading, error: availabilityError } =
    useDateAvailability(mockSalonProfile.salonId, activeDay.dateKey);

  const selectedServices: BookedService[] = useMemo(
    () =>
      mockSalonProfile.services
        .filter((s) => selectedServiceIds.includes(s.id))
        .map((s) => ({
          serviceId: s.id,
          serviceName: s.name,
          durationMinutes: s.durationMinutes,
        })),
    [selectedServiceIds]
  );

  const totalDurationMinutes = useMemo(
    () =>
      getTotalDurationMinutes(
        mockSalonProfile.services.filter((s) => selectedServiceIds.includes(s.id))
      ),
    [selectedServiceIds]
  );

  const isToday = activeDay.key === "today";
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const dateLabel = formatDisplayDate(activeDay.dateKey);
  const timeLabel = selectedTime ? to12h(selectedTime) : "";
  const servicesLabel = selectedServices.map((s) => s.serviceName).join(", ");

  const handleDateChange = (key: BookableDayKey) => {
    setActiveKey(key);
    setSelectedTime(undefined);
    setSubmitError(null);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
    setSelectedTime(undefined);
    setSubmitError(null);
  };

  const sessionSlots = useMemo(() => {
    if (dayConfig.isClosed) return [];
    return SESSION_ORDER.map((sessionKey) => {
      const session = dayConfig[sessionKey];
      if (!session) return null;
      return {
        key: sessionKey,
        slots: buildSessionSlots({
          session,
          baseSlotIntervalMinutes,
          totalDurationMinutes,
          occupiedSlots,
          isToday,
          nowMinutes,
        }),
      };
    }).filter((s): s is { key: SessionKey; slots: ReturnType<typeof buildSessionSlots> } => !!s);
  }, [dayConfig, baseSlotIntervalMinutes, totalDurationMinutes, occupiedSlots, isToday, nowMinutes]);

  const selectedSlotStillValid = useMemo(() => {
    if (!selectedTime) return false;
    return sessionSlots.some((s) =>
      s.slots.some((slot) => slot.time24 === selectedTime && isSlotSelectable(slot))
    );
  }, [selectedTime, sessionSlots]);

  // MULTI-TAB SYNC (Priority 6): the live `occupiedSlots` listener means this
  // effect fires the instant another tab/device/customer takes the slot the
  // user currently has selected — clears it, drops out of any open modal, and
  // shows a message, so Continue can never be clicked through to a stale
  // selection and Confirm can never be submitted against a slot that's
  // already gone.
  useEffect(() => {
    if (!selectedTime) return;
    if (selectedSlotStillValid) return;

    setSlotLostMessage("That time is no longer available. Please choose another.");
    setSelectedTime(undefined);
    if (modalStage !== "none") {
      setModalStage("none");
      setPendingContact(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlotStillValid]);

  // AUTH EDGE CASE (Priority 7): logging out in another tab while a booking
  // modal is open here must not leave a modal live with a now-stale customer
  // identity — close everything and send the user back to a safe state.
  const wasAuthenticatedRef = useRef(false);
  useEffect(() => {
    if (user) {
      wasAuthenticatedRef.current = true;
      return;
    }
    if (wasAuthenticatedRef.current && modalStage !== "none") {
      setModalStage("none");
      setPendingContact(null);
      setSubmitError("You've been signed out. Please sign in again to continue booking.");
    }
    wasAuthenticatedRef.current = false;
  }, [user, modalStage]);

  const canContinue =
    selectedServiceIds.length > 0 &&
    selectedSlotStillValid &&
    !availabilityLoading &&
    !authLoading;

  const handleContinueClick = async () => {
    if (!canContinue) return;

    // Bug 4 guard: only advance on a VERIFIED signed-in user. A cancelled
    // popup returns false here, so no modal opens and no draft is created —
    // the user stays put with Continue available for retry.
    const authenticated = await ensureAuthenticated();
    if (!authenticated) return;

    // Fresh idempotency key per NEW attempt — see utils/idempotency.ts. Not
    // regenerated on a same-attempt retry (that would defeat the point).
    setSlotLostMessage(null);
    setModalStage("contact");
  };

  const handleContactReview = (payload: ContactDetailsSubmitPayload) => {
    setPendingContact(payload);
    setSubmitError(null);
    setModalStage("review");
  };

  const bookingEndTime = useMemo(() => {
  if (!selectedTime) return "";

  const [hours, minutes] = selectedTime.split(":").map(Number);
  const total = hours * 60 + minutes + totalDurationMinutes;

  const endHours = Math.floor(total / 60);
  const endMinutes = total % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}, [selectedTime, totalDurationMinutes]);


 const handleConfirmBooking = async () => {
  if (!pendingContact || !selectedTime) return;

  try {
    const booking = await createBooking({
      salonId: mockSalonProfile.salonId,
salonName: mockSalonProfile.name,

      customerId: user!.uid,
      customerName: pendingContact.customerName,
      customerEmail: user?.email ?? null,
      customerPhone: pendingContact.customerPhone,

      services: selectedServices.map((service) => ({
  serviceId: service.serviceId,
  serviceName: service.serviceName,
  durationMinutes: service.durationMinutes,
})),

      totalDurationMinutes,
      appointmentDate: activeDay.dateKey,
      appointmentTime: selectedTime,
      appointmentEndTime: bookingEndTime,
      baseSlotIntervalMinutes: mockWorkingHoursConfig.baseSlotIntervalMinutes,
    });

    setModalStage("none");
    setPendingContact(null);
    navigate("/booking-confirmed", { state: booking });
  } catch (err) {
    if (err instanceof SlotTakenError) {
      setSubmitError(err.message);
      setSelectedTime(undefined);
      setModalStage("none");
    } else {
      console.error("Booking creation failed:", err);
      setSubmitError(
        "Something went wrong creating your booking. Please try again."
      );
    }
  }
};

  return (
    <div className="min-h-screen bg-[#1F2128] pb-28">
      <ResponsiveContainer>
        <header className="pt-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-medium text-[#B8BCC8]"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <p className="mt-4 text-[0.75rem] leading-[1.4rem] font-medium uppercase tracking-wide text-[#B8BCC8]">
            BARB7 UNISEX SALON
          </p>
          <h1 className="mt-1 text-xl font-bold text-[#F5F1EA]">Book Appointment</h1>
        </header>

        <DateTabs days={days} activeKey={activeKey} onChange={handleDateChange} />

        <div className="pt-2">
          {dayConfig.isClosed ? (
            <p className="mt-6 text-sm text-[#B8BCC8]">
              Salon is closed on {activeDay.monthShort} {activeDay.dayNum}.
            </p>
          ) : (
            <>
              <ServiceSelector
                services={mockSalonProfile.services}
                selectedIds={selectedServiceIds}
                totalDurationMinutes={totalDurationMinutes}
                onToggle={handleServiceToggle}
              />

              {selectedServiceIds.length === 0 ? (
  <p className="mt-2 text-sm text-[#B8BCC8]">
    Select at least one service to see available times.
  </p>
) : availabilityLoading ? (
  <p className="mt-4 text-sm text-[#B8BCC8]">Loading available time slots...</p>
) : (
  sessionSlots.map(({ key, slots }) => (
    <SessionSection
      key={key}
      title={SESSION_LABELS[key]}
      slots={slots}
      selectedTime={selectedTime}
      onSelect={(time24) => {
        setSelectedTime(time24);
        setSubmitError(null);
        setSlotLostMessage(null);
      }}
    />
  ))
)}
            </>
          )}

          <div aria-live="polite">
            {slotLostMessage && (
              <p className="mt-2 text-[0.75rem] leading-[1.4rem] text-red-400">{slotLostMessage}</p>
            )}
            {availabilityError && (
              <p className="mt-2 text-[0.75rem] leading-[1.4rem] text-red-400">{availabilityError}</p>
            )}
            {submitError && !["contact", "review"].includes(modalStage) && (
  <div className="mt-2">
    <p className="text-[0.75rem] leading-[1.4rem] text-red-400">{submitError}</p>
  </div>
)}
            {authStatus === "error" && authError && (
              <p className="mt-2 text-[0.75rem] leading-[1.4rem] text-red-400">{authError}</p>
            )}
          </div>
        </div>
      </ResponsiveContainer>

      <StickyContinueCTA
        enabled={canContinue}
        loading={authStatus === "authenticating"}
        onContinue={handleContinueClick}
      />

      <ContactDetailsModal
        open={modalStage === "contact"}
        defaultName={user?.name ?? ""}
        email={user?.email ?? null}
        salonName={mockSalonProfile.name}
        dateLabel={dateLabel}
        timeLabel={timeLabel}
        servicesLabel={servicesLabel}
        onClose={() => setModalStage("none")}
        onSubmit={handleContactReview}
      />

      <ReviewBookingModal
  open={modalStage === "review"}
  salonName={mockSalonProfile.name}
  dateLabel={dateLabel}
  timeLabel={timeLabel}
  email={user?.email ?? null}
  services={selectedServices}
  contact={pendingContact}
  submitting={submitting}
  errorMessage={submitError}
  onClose={() => setModalStage("none")}
  onConfirm={handleConfirmBooking}
/>
    </div>
  );
}
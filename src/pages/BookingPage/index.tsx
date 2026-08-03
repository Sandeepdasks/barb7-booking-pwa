import { useMemo, useState } from "react";
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
import { to12h, getSlotEndTime } from "../../utils/slotGenerator"; // to12h still needed for the slot grid itself, not the summary label
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

const SESSION_ORDER: SessionKey[] = ["morning", "afternoon", "evening"];
const SESSION_LABELS: Record<SessionKey, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

type ModalStage = "none" | "contact" | "review";

export function BookingPage() {
  const navigate = useNavigate();
  const days = useMemo(() => getBookableDays(), []);
  const [activeKey, setActiveKey] = useState<BookableDayKey>(days[0].key);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const { user } = useAuth();
  const { status: authStatus, errorMessage: authError, ensureAuthenticated } = useBookingAuthGate();
  const [modalStage, setModalStage] = useState<ModalStage>("none");
  const [pendingContact, setPendingContact] = useState<ContactDetailsSubmitPayload | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeDay = days.find((d) => d.key === activeKey)!;
  const dayConfig = mockWorkingHoursConfig[activeDay.weekday];
  const baseSlotIntervalMinutes = mockWorkingHoursConfig.baseSlotIntervalMinutes;

  // Live Firestore availability — survives refresh, updates across devices.
  const { occupiedSlots, loading: availabilityLoading, error: availabilityError } =
    useDateAvailability(mockSalonProfile.salonId, activeDay.dateKey, baseSlotIntervalMinutes);

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

  // Changing date or services invalidates any chosen time — durations shift
  // which starts are valid, so a stale selection could overflow closing time.
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

  const canContinue =
    selectedServiceIds.length > 0 && selectedSlotStillValid && !availabilityLoading;

  const handleContinueClick = async () => {
    if (!canContinue) return;

    // Bug 4 guard: only advance on a VERIFIED signed-in user. A cancelled
    // popup returns false here, so no modal opens and no draft is created —
    // the user stays put with Continue available for retry.
    const authenticated = await ensureAuthenticated();
    if (!authenticated) return;

    setModalStage("contact");
  };

  const handleContactReview = (payload: ContactDetailsSubmitPayload) => {
    setPendingContact(payload);
    setSubmitError(null);
    setModalStage("review");
  };

  const handleConfirmBooking = async () => {
    if (!pendingContact || !selectedTime || !user) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Firestore transaction re-checks every required slot lock immediately
      // before writing — this is what stops two devices booking the same time.
      const booking = await createBooking({
        salonId: mockSalonProfile.salonId,
        salonName: mockSalonProfile.name,
        customerId: user.uid,
        customerName: pendingContact.customerName,
        customerEmail: user.email ?? null,
        customerPhone: pendingContact.customerPhone,
        services: selectedServices,
        totalDurationMinutes,
        appointmentDate: activeDay.dateKey,
        appointmentTime: selectedTime,
        appointmentEndTime: getSlotEndTime(selectedTime, totalDurationMinutes),
        baseSlotIntervalMinutes,
      });

      setModalStage("none");
      setPendingContact(null);
      navigate("/booking-confirmed", { state: booking });
    } catch (err) {
      if (err instanceof SlotTakenError) {
        // Lost the race — send them back to the grid, which the live listener
        // has already updated to show the slot as booked.
        setSubmitError(err.message);
        setSelectedTime(undefined);
        setModalStage("none");
      } else {
        console.error("Booking failed:", err);
        setSubmitError("Something went wrong creating your booking. Please try again.");
      }
    } finally {
      setSubmitting(false);
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
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#B8BCC8]">
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
                <p className="mt-2 text-sm text-[#B8BCC8]">Loading available times…</p>
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
                    }}
                  />
                ))
              )}
            </>
          )}

          {availabilityError && (
            <p className="mt-2 text-xs text-red-400">{availabilityError}</p>
          )}
          {submitError && <p className="mt-2 text-xs text-red-400">{submitError}</p>}
          {authStatus === "error" && authError && (
            <p className="mt-2 text-xs text-red-400">{authError}</p>
          )}
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
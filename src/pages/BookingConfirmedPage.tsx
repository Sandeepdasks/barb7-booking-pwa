import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Booking } from "../types/bookingRecord";
import { formatDisplayDate, formatDisplayTimeRange } from "../utils/dateUtils";
import { ResponsiveContainer } from "../components/layout/ResponsiveContainer";

// BARB7 palette confetti — gold, white, soft champagne. Elegant, not
// excessive: one gentle top burst plus soft side cannons, ~3s total, then stops.
const CONFETTI_COLORS = ["#C9A278", "#F5F1EA", "#EDE0D0"];

function fireCelebrationConfetti() {
  const durationMs = 3000;
  const endAt = Date.now() + durationMs;

  confetti({
    particleCount: 70,
    spread: 100,
    startVelocity: 35,
    origin: { y: 0.15 },
    colors: CONFETTI_COLORS,
  });

  (function sideCannons() {
    confetti({
      particleCount: 1,
      angle: 60,
      spread: 20,
      origin: { x: 0, y: 0.4 },
      colors: CONFETTI_COLORS,
    });
    confetti({
      particleCount: 1,
      angle: 120,
      spread: 20,
      origin: { x: 1, y: 0.4 },
      colors: CONFETTI_COLORS,
    });
    //const endAt = Date.now() + 1200; // 1.2 seconds
    if (Date.now() < endAt) {
      requestAnimationFrame(sideCannons);
    }
  })();
}

// Reads the just-created Booking from router state (passed by BookingPage's
// navigate("/booking-confirmed", { state: booking })) — no duplicate booking
// data, no re-fetch.
export function BookingConfirmedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state as Booking | null;

  useEffect(() => {
    if (booking) fireCelebrationConfetti();
    // Runs once on mount only — re-firing on unrelated re-renders would feel
    // gimmicky rather than a one-time celebration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1F2128] px-6 text-center">
        <p className="text-sm text-[#B8BCC8]">No booking to show.</p>
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="mt-4 rounded-[10px] bg-[#C9A278] px-5 py-2.5 text-sm font-semibold text-[#1F2128]"
        >
          Back to Booking
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1F2128] py-10">
      <ResponsiveContainer className="flex flex-col items-center text-center">
        <CheckCircle2 size={56} className="text-[#C9A278]" />
        <h1 className="mt-5 text-xl font-bold text-[#F5F1EA]">Booking Confirmed</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#B8BCC8]">
          Your appointment has been reserved.
          <br />
          A confirmation has been sent to your email.
        </p>

        <div className="mt-7 w-full max-w-sm rounded-[20px] border border-[#C9A278]/40 bg-[#2E313C] p-5 text-left">
          <p className="text-sm font-bold text-[#F5F1EA]">{booking.salonName}</p>
          <dl className="mt-3 space-y-2 text-xs">
            <Row label="Date" value={formatDisplayDate(booking.appointmentDate)} />
            <Row
              label="Time"
              value={formatDisplayTimeRange(booking.appointmentTime, booking.appointmentEndTime)}
            />
            <Row label="Service" value={booking.services.map((s) => s.serviceName).join(", ")} />
            <Row label="Name" value={booking.customerName} />
            <Row label="Phone" value={booking.customerPhone} />
            <Row label="Booking ID" value={booking.bookingId} />
          </dl>
        </div>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-[10px] bg-[#C9A278] py-3 text-sm font-semibold text-[#1F2128]"
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-bookings")}
            className="w-full rounded-[10px] bg-[#2E313C] py-3 text-sm font-semibold text-[#F5F1EA]"
          >
            View My Bookings
          </button>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#B8BCC8]">{label}</dt>
      <dd className="text-right font-medium text-[#F5F1EA]">{value}</dd>
    </div>
  );
}
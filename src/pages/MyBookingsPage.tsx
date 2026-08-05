import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BookingTabs, BookingTabKey } from "../components/Booking/BookingTabs";
import { BookingCard } from "../components/Booking/BookingCard";
import { CancelBookingDialog } from "../components/Booking/CancelBookingDialog";
import { BookingsSkeleton } from "../components/Booking/BookingsSkeleton";
import { EmptyBookingsState } from "../components/Booking/EmptyBookingsState";
import { Toast } from "../components/shared/Toast";
import { ResponsiveContainer } from "../components/layout/ResponsiveContainer";
import { useBookingAuthGate } from "../components/Booking/BookingAuthGate";
import { useMyBookings } from "../hooks/useMyBookings";
import { cancelBookingByCustomer } from "../services/bookingService";
import { mockWorkingHoursConfig } from "../services/mockWorkingHoursConfig";
import { isUpcomingBooking } from "../types/bookingRecord";
// ASSUMPTION (see BookingAuthGate.tsx) — adjust path if your AuthContext differs.
import { useAuth } from "../contexts/AuthContext";

const PULL_THRESHOLD_PX = 70;

export function MyBookingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { ensureAuthenticated } = useBookingAuthGate();
  const [activeTab, setActiveTab] = useState<BookingTabKey>("upcoming");
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartY = useRef<number | null>(null);

  const { bookings, loading, error, refresh } = useMyBookings(user?.uid ?? null);

  // Re-check the Upcoming/Past boundary periodically, not just on refresh —
  // a booking whose end time passes while this page is left open should still
  // move to Past without the customer having to reload.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Route guard. `authLoading` matters here: on a hard refresh Firebase
  // restores the session asynchronously, so without waiting we'd fire a
  // sign-in popup at a user who is already authenticated — that was the
  // "asks to authenticate again after refresh" half of Bug 1.
  useEffect(() => {
    if (authLoading || user) return;

    let cancelled = false;
    (async () => {
      const authenticated = await ensureAuthenticated();
      if (!cancelled && !authenticated) navigate("/", { replace: true });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // --- Pull-to-refresh (mobile) -----------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return; // only when already at the top
    pullStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current === null) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) setPullDistance(Math.min(delta, PULL_THRESHOLD_PX * 1.5));
  };

  const handleTouchEnd = async () => {
    const shouldRefresh = pullDistance >= PULL_THRESHOLD_PX;
    pullStartY.current = null;
    setPullDistance(0);
    if (!shouldRefresh || refreshing) return;

    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCancelConfirmed = async () => {
    const id = pendingCancelId;
    setPendingCancelId(null);
    if (!id) return;

    try {
      // Releases the slot locks too, so the time becomes bookable again —
      // the availability listener on the booking page picks that up live.
      await cancelBookingByCustomer(id, mockWorkingHoursConfig.baseSlotIntervalMinutes);
      setToastMessage("Your booking has been cancelled successfully.");
    } catch (err) {
      console.error("Cancellation failed:", err);
      setToastMessage("Couldn't cancel your booking. Please try again.");
    }
  };

  const upcoming = useMemo(
    () => bookings.filter((b) => isUpcomingBooking(b, nowTick)),
    [bookings, nowTick]
  );
  const past = useMemo(
    () => bookings.filter((b) => !isUpcomingBooking(b, nowTick)),
    [bookings, nowTick]
  );
  const list = activeTab === "upcoming" ? upcoming : past;

  const showSkeleton = authLoading || (!!user && loading);

  return (
    <div
      className="min-h-screen bg-[#1F2128] pb-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
          <h1 className="mt-4 text-xl font-bold text-[#F5F1EA]">My Bookings</h1>
        </header>

        {(pullDistance > 0 || refreshing) && (
          <div
            className="flex items-center justify-center overflow-hidden text-[#C9A278] transition-[height]"
            style={{ height: refreshing ? 40 : pullDistance }}
          >
            <Loader2
              size={18}
              className={refreshing ? "animate-spin" : ""}
              style={{ opacity: Math.min(pullDistance / PULL_THRESHOLD_PX, 1) }}
            />
          </div>
        )}

        {showSkeleton ? (
          <BookingsSkeleton />
        ) : (
          <>
            <BookingTabs activeKey={activeTab} onChange={setActiveTab} />

            {error && <p className="mb-3 text-[0.75rem] leading-[1.4rem] text-red-400">{error}</p>}

            {list.length === 0 ? (
              <EmptyBookingsState
                variant={activeTab}
                onBookAppointment={() => navigate("/booking")}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {list.map((booking) => (
                  <BookingCard
                    key={booking.bookingId}
                    booking={booking}
                    variant={activeTab}
                    onCancel={() => setPendingCancelId(booking.bookingId)}
                    onBookAgain={() => navigate("/booking")}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </ResponsiveContainer>

      <CancelBookingDialog
        open={pendingCancelId !== null}
        onKeepBooking={() => setPendingCancelId(null)}
        onConfirmCancel={handleCancelConfirmed}
      />

      <Toast
        open={toastMessage !== null}
        message={toastMessage ?? ""}
        onDismiss={() => setToastMessage(null)}
      />
    </div>
  );
}
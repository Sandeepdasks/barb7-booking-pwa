import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockSalonProfile } from "../../services/mockSalonService";
import { HeroSection } from "../../components/landing/HeroSection";
import { AboutSection } from "../../components/landing/AboutSection";
import { ServicesGrid } from "../../components/landing/ServicesGrid";
import { StickyBookCTA } from "../../components/landing/StickyBookCTA";
import { LogoutConfirmationDialog } from "../../components/landing/LogoutConfirmationDialog";
import { ResponsiveContainer } from "../../components/layout/ResponsiveContainer";
// ASSUMPTION (see BookingAuthGate.tsx) — adjust paths if your real AuthContext/
// authService live elsewhere. `signOutUser` assumed alongside the existing
// `signInWithGoogle` in services/authService.ts.
import { useAuth } from "../../contexts/AuthContext";
import { signOutUser } from "../../services/authService";

// Swap mockSalonService for a real Firestore-backed hook later —
// component tree below needs zero changes when that happens.
export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleBook = () => {
    // Auth (if needed) happens later, at Continue-click on the booking page —
    // not here. Landing → Booking Page is a plain, unauthenticated navigation.
    navigate("/booking");
  };

  const handleMyBookings = () => {
    // Button only renders when `user` exists (see StickyBookCTA isAuthenticated),
    // so no auth gate needed here — MyBookingsPage re-guards itself anyway for
    // anyone who lands there directly.
    navigate("/my-bookings");
  };

  // Icon tap only opens the confirmation popup — the actual sign-out is
  // gated behind the dialog's "Logout" button below.
  const handleLogoutIconClick = () => setShowLogoutConfirm(true);

  const handleConfirmLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
    setShowLogoutConfirm(false);
    // Always land back on "/" — AuthContext's `user` clearing (via its own
    // onAuthStateChanged listener) drives the rest of the UI update.
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#1F2128] pb-28">
      <HeroSection
        salon={mockSalonProfile}
        isAuthenticated={!!user}
        onLogout={handleLogoutIconClick}
      />
      <ResponsiveContainer>
        <AboutSection salon={mockSalonProfile} />
        <ServicesGrid services={mockSalonProfile.services} />
      </ResponsiveContainer>
      <StickyBookCTA
        onBook={handleBook}
        onMyBookings={handleMyBookings}
        isAuthenticated={!!user}
      />

      <LogoutConfirmationDialog
        open={showLogoutConfirm}
        onStayLoggedIn={() => setShowLogoutConfirm(false)}
        onLogout={handleConfirmLogout}
      />
    </div>
  );
}
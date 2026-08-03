import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPages/LandingPage";
import { BookingPage } from "./pages/BookingPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { BookingConfirmedPage } from "./pages/BookingConfirmedPage";
// ASSUMPTION (see BookingAuthGate.tsx) — adjust if your real AuthProvider
// already wraps the app elsewhere, or lives at a different path.
import { AuthProvider } from "./contexts/AuthContext";
// Side-effect import: registers the email handler on the booking event bus
// (services/notificationEvents.ts). Must load once at app startup.
import "./services/notificationService";

// FLAG: no App.tsx existed in this sandbox, so this is a minimal router
// covering only what this phase requires. If your real project's App.tsx
// already has other routes (owner/admin dashboards, auth pages, etc. from
// earlier phases), merge these four <Route> entries into it — don't overwrite.
// This is also the fix for "No routes matched location /booking-confirmed":
// that route simply didn't exist in the router before now.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/booking-confirmed" element={<BookingConfirmedPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
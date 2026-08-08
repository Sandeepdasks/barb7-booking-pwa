import { Routes, Route, Outlet } from "react-router-dom";

import { LandingPage } from "./pages/LandingPages/LandingPage";
import { BookingPage } from "./pages/BookingPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { BookingConfirmedPage } from "./pages/BookingConfirmedPage";
import { OwnerNotificationsPage } from "./pages/owner/OwnerNotificationsPage";

import { OwnerLoginPage } from "./pages/owner/OwnerLoginPage";
import { OwnerDashboardPage } from "./pages/owner/OwnerDashboardPage";
import { OwnerSchedulePage } from "./pages/owner/OwnerSchedulePage";
import WorkingHoursSettingsPage from "./pages/owner/WorkingHoursSettingsPage";
import { OwnerSpecialClosuresPage } from '@/pages/owner/OwnerSpecialClosuresPage';
import { OwnerAddBookingPage } from "./pages/owner/OwnerAddBookingPage";
import { OwnerSettingsPage } from "./pages/owner/OwnerSettingsPage";
import { OwnerAddEditClosurePage } from './pages/owner/OwnerAddEditClosurePage';

import { AuthProvider } from "./contexts/AuthContext";
import {
  OwnerAuthProvider,
  useOwnerAuth,
} from "./contexts/OwnerAuthContext";

import { OwnerProtectedRoute } from "../routes/OwnerProtectedRoute";

function CustomerAuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function OwnerAuthLayout() {
  return (
    <OwnerAuthProvider>
      <Outlet />
    </OwnerAuthProvider>
  );
}

function OwnerEntryPage() {
  const { ownerProfile, loading } = useOwnerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return ownerProfile ? <OwnerDashboardPage /> : <OwnerLoginPage />;
}

export default function App() {
  return (
    <Routes>
      {/* =========================
          CUSTOMER APP
      ========================== */}
      <Route element={<CustomerAuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route
          path="/booking-confirmed"
          element={<BookingConfirmedPage />}
        />
      </Route>

      {/* =========================
          OWNER PORTAL
      ========================== */}
      <Route element={<OwnerAuthLayout />}>
        {/* Login when logged out / Dashboard when logged in */}
        <Route path="/owner.html" element={<OwnerEntryPage />} />

        <Route
        path="/owner/notifications"
        element={
          <OwnerProtectedRoute>
            <OwnerNotificationsPage />
          </OwnerProtectedRoute>
        }
/>

        <Route
          path="/owner/bookings/new"
          element={
            <OwnerProtectedRoute>
              <OwnerAddBookingPage />
            </OwnerProtectedRoute>
          }
        />

        <Route
          path="/owner/schedule"
          element={
            <OwnerProtectedRoute>
              <OwnerSchedulePage />
            </OwnerProtectedRoute>
          }
        />

        <Route
          path="/owner/settings"
          element={
            <OwnerProtectedRoute>
              <OwnerSettingsPage />
            </OwnerProtectedRoute>
          }
        />

        <Route
          path="/owner/settings/working-hours"
          element={
            <OwnerProtectedRoute>
              <WorkingHoursSettingsPage />
            </OwnerProtectedRoute>
          }
        />
        <Route
          path="/owner/settings/special-closures"
          element={
            <OwnerProtectedRoute>
              <OwnerSpecialClosuresPage />
            </OwnerProtectedRoute>
          }
        />
        <Route
          path="/owner/settings/special-closures/new"
          element={
            <OwnerProtectedRoute>
              <OwnerAddEditClosurePage />
            </OwnerProtectedRoute>
          }
        />

        <Route
          path="/owner/settings/special-closures/:closureId/edit"
          element={
            <OwnerProtectedRoute>
              <OwnerAddEditClosurePage />
            </OwnerProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
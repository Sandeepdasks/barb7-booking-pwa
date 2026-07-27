import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomerLoginPage } from '@/features/auth/pages/CustomerLoginPage';
import { OwnerLoginPage } from '@/features/auth/pages/OwnerLoginPage';
import { AdminLoginPage } from '@/features/auth/pages/AdminLoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Route skeleton — booking/owner/admin screens are placeholders until
// their respective phases. Only the auth routes and role gating are real.
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerLoginPage />} />
        <Route path="/owner/login" element={<OwnerLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/owner"
          element={
            <ProtectedRoute allowed={['owner']} redirectTo="/owner/login">
              <div className="text-center mt-16">Owner Dashboard (Phase 4)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowed={['admin']} redirectTo="/admin/login">
              <div className="text-center mt-16">Admin Dashboard (Phase 5)</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

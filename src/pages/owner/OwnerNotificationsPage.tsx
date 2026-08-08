import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';

// Placeholder only — no Firestore queries, notification model, or activity feed yet.
// Future purpose: new bookings, cancellations (customer + owner), and appointment activity.
export function OwnerNotificationsPage() {
  const navigate = useNavigate();

  return (
    <OwnerPageShell
      header={<OwnerHeader title="Notifications" onBack={() => navigate('/owner.html')} />}
    >
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1C2230] text-[#A7AAB4]">
          <Bell size={28} strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 text-[17px] font-semibold text-[#F5F5F5]">Notifications</h2>
        <p className="mt-2 max-w-xs text-[14px] text-[#A7AAB4]">
          Booking and cancellation activity will appear here.
        </p>
        <p className="mt-1 max-w-xs text-[12px] text-[#6E7482]">
          We'll show new bookings, customer cancellations and recent activity here.
        </p>
      </div>
    </OwnerPageShell>
  );
}

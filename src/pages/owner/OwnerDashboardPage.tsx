import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, CircleCheck, Settings as SettingsIcon, Plus } from 'lucide-react';
import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { useDashboardStats } from '@/hooks/owner/useDashboardStats';
import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';
import { MetricCard } from '@/components/owner/dashboard/MetricCard';
import { OwnerButton, OwnerCard, OwnerSpinner } from '@/components/owner/ui';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Icon sizing/stroke kept uniform across the dashboard per design spec.
const ICON_SIZE = 20;
const ICON_STROKE = 1.75;

export function OwnerDashboardPage() {
  const { ownerProfile } = useOwnerAuth();
  const { stats, date, loading } = useDashboardStats(ownerProfile?.salonId);
  const navigate = useNavigate();

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <OwnerPageShell
      header={
        <OwnerHeader
          title="BARB7"
          //right={
            //<button
            //  type="button"
            //  aria-label="Notifications"
            //  onClick={() => navigate('/owner/notifications')}
            //  className="flex h-11 w-11 items-center justify-center rounded-full text-[#A7AAB4] transition-colors duration-150 hover:bg-[#1C2230] active:bg-[#1C2230]"
            //>
            //  <Bell size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            //</button>
          //}
        />
      }
    >
      {/* Date / greeting — date line is slightly larger than before, still visually secondary */}
      <p className="text-[14px] text-[#6E7482]">Today · {dateLabel}</p>
      <h1 className="mb-5 text-[22px] font-semibold text-[#F5F5F5]">
        {greeting()}, {ownerProfile?.name?.split(' ')[0] ?? 'Owner'} 👋
      </h1>

      {loading ? (
        <OwnerSpinner />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Full-width Bookings card */}
          <MetricCard
            label="Bookings"
            value={stats.bookingsToday}
            subtitle="Today's total"
            icon={<CalendarDays size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            tone="primary"
          />

          {/* Pending + Done, equal width/height */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Pending"
              value={stats.pending}
              subtitle="Today's tasks"
              icon={<Clock3 size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
              tone="warning"
            />
            <MetricCard
              label="Done"
              value={stats.completed}
              subtitle="Completed"
              icon={<CircleCheck size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
              tone="success"
            />
          </div>
        </div>
      )}

      <h2 className="mb-3 mt-7 text-[12px] font-semibold uppercase tracking-wide text-[#6E7482]">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-3">
        <OwnerCard onClick={() => navigate('/owner/schedule')}>
          <div className="flex items-center gap-3">
            <span className="text-[#C8A06B]">
              <CalendarDays size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium text-[#F5F5F5]">Today Schedule</div>
              <div className="truncate text-[12px] text-[#6E7482]">View and manage appointments</div>
            </div>
            <span className="text-[#6E7482]">›</span>
          </div>
        </OwnerCard>

        <OwnerCard onClick={() => navigate('/owner/settings')}>
          <div className="flex items-center gap-3">
            <span className="text-[#C8A06B]">
              <SettingsIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium text-[#F5F5F5]">Settings</div>
              <div className="truncate text-[12px] text-[#6E7482]">
                Working hours & special closures
              </div>
            </div>
            <span className="text-[#6E7482]">›</span>
          </div>
        </OwnerCard>
      </div>

      {/* Primary bottom action — normal page flow, not sticky, per spec */}
      <div className="mt-10">
        <OwnerButton
          variant="primary"
          fullWidth
          heightClassName="h-[3.2rem]"
          onClick={() => navigate('/owner/bookings/new')}
          className="flex items-center justify-center gap-2"
        >
          <Plus size={ICON_SIZE} strokeWidth={2} />
          Add Booking
        </OwnerButton>
      </div>
    </OwnerPageShell>
  );
}

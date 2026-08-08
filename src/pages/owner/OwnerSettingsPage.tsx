import { useNavigate } from 'react-router-dom';
import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';
import { OwnerCard } from '@/components/owner/ui';
import {
  Clock3,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { ReactNode } from 'react';

function SettingsRow({
  icon,
  title,
  subtitle,
  onClick,
  danger,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <OwnerCard onClick={onClick} className="mb-3">
      <div className="flex items-center gap-3">
        <span className="text-[20px]">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className={`text-[15px] font-medium ${danger ? 'text-[#F5F5F5]' : 'text-[#F5F5F5]'}`}>
            {title}
          </div>
          {subtitle && <div className="text-[12px] text-[#6E7482]">{subtitle}</div>}
        </div>
        {!danger && <span className="text-[#6E7482]">›</span>}
      </div>
    </OwnerCard>
  );
}

export function OwnerSettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useOwnerAuth();

  return (
   <OwnerPageShell
  header={
    <OwnerHeader
      title="Settings"
      onBack={() => navigate('/owner.html')}
    />
  }
>
  <h2 className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#6E7482]">
    Salon Operations
  </h2>

  <SettingsRow
    icon={
      <Clock3
        size={22}
        strokeWidth={2}
        className="shrink-0 text-[#C8A06B]"
      />
    }
    title="Working Hours"
    subtitle="Set opening & closing times"
    onClick={() =>
      navigate('/owner/settings/working-hours')
    }
  />

  <SettingsRow
    icon={
      <CalendarDays
        size={22}
        strokeWidth={2}
        className="shrink-0 text-[#C8A06B]"
      />
    }
    title="Special Closures"
    subtitle="Holidays & temporary closures"
    onClick={() =>
      navigate('/owner/settings/special-closures')
    }
  />

      <h2 className="mb-3 mt-6 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#6E7482]">
        Account
      </h2>
      <SettingsRow
        icon={
          <LogOut
            size={22}
            strokeWidth={2}
            className="shrink-0 text-[#C8A06B]"
          />
        }
        title="Logout"
        onClick={() => signOut()}
        danger
      />
    </OwnerPageShell>
  );
}

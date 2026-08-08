import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarClock } from 'lucide-react';

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${
    isActive ? 'text-[#C9A278]' : 'text-[#B8BCC8]'
  }`;

export const OwnerBottomNav: FC = () => (
  <nav className="sticky bottom-0 z-10 flex border-t border-white/5 bg-[#1F2128]/95 backdrop-blur">
    <NavLink to="/owner" end className={linkClass}>
      <LayoutDashboard size={20} />
      Dashboard
    </NavLink>
    <NavLink to="/owner/schedule" className={linkClass}>
      <CalendarClock size={20} />
      Schedule
    </NavLink>
  </nav>
);

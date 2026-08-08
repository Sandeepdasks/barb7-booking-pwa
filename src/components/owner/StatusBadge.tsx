import type { FC } from 'react';
import type { BookingStatus } from '../../types/owner.types';

const STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-[#C9A278]/15 text-[#C9A278] border-[#C9A278]/40',
  in_progress: 'bg-blue-400/15 text-blue-300 border-blue-400/40',
  completed: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40',
  cancelled: 'bg-red-400/15 text-red-300 border-red-400/40',
  no_show: 'bg-[#B8BCC8]/15 text-[#B8BCC8] border-[#B8BCC8]/40',
};

const LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

interface StatusBadgeProps {
  status: BookingStatus;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${STYLES[status]}`}
  >
    {LABELS[status]}
  </span>
);

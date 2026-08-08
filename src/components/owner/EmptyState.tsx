import type { FC } from 'react';
import { CalendarX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ message = 'No bookings for this day.' }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 py-12 text-center">
    <CalendarX size={28} className="text-[#B8BCC8]" />
    <p className="text-sm text-[#B8BCC8]">{message}</p>
  </div>
);

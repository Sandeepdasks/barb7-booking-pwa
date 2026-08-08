import type { FC } from 'react';
import { Phone, Clock } from 'lucide-react';
import type { Booking, BookingStatus } from '../../types/owner.types';
import { StatusBadge } from './StatusBadge';

const NEXT_STATUS: Record<BookingStatus, BookingStatus | null> = {
  confirmed: 'in_progress',
  in_progress: 'completed',
  completed: null,
  cancelled: null,
  no_show: null,
};

const NEXT_LABEL: Record<BookingStatus, string> = {
  confirmed: 'Start',
  in_progress: 'Mark Completed',
  completed: '',
  cancelled: '',
  no_show: '',
};

interface BookingCardProps {
  booking: Booking;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
}

export const BookingCard: FC<BookingCardProps> = ({ booking, onStatusChange }) => {
  const nextStatus = NEXT_STATUS[booking.status];
  const isTerminal = booking.status === 'cancelled' || booking.status === 'no_show';

  return (
    <div className="rounded-2xl border border-white/5 bg-[#2E313C] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#F5F1EA]">{booking.serviceName}</p>
          <p className="mt-0.5 text-sm text-[#B8BCC8]">{booking.customerName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#B8BCC8]">
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-[#C9A278]" />
          {booking.time} • {booking.durationMins} min
        </span>
        <a
          href={`tel:${booking.customerPhone}`}
          className="flex items-center gap-1.5 text-[#B8BCC8] hover:text-[#C9A278]"
        >
          <Phone size={14} className="text-[#C9A278]" />
          {booking.customerPhone}
        </a>
      </div>

      {!isTerminal && (
        <div className="mt-3 flex gap-2">
          {nextStatus && (
            <button
              type="button"
              onClick={() => onStatusChange(booking.id, nextStatus)}
              className="rounded-lg bg-[#C9A278] px-3 py-1.5 text-sm font-medium text-[#1F2128] active:opacity-80"
            >
              {NEXT_LABEL[booking.status]}
            </button>
          )}
          <button
            type="button"
            onClick={() => onStatusChange(booking.id, 'no_show')}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[#B8BCC8] active:opacity-80"
          >
            No Show
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(booking.id, 'cancelled')}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[#B8BCC8] active:opacity-80"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

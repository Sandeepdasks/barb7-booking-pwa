import { BottomSheet } from '@/components/owner/ui/BottomSheet';
import { OwnerButton, OwnerBadge } from '@/components/owner/ui';
import { formatRange12h } from '@/utils/scheduleTimeline';
import { BOOKING_SOURCE_LABEL } from '@/types/owner';
import type { Appointment } from '@/types/owner';

export function BookingDetailsSheet({
  appointment,
  open,
  onClose,
  onMarkCompleted,
  onCancelAndBlock,
  updating,
}: {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onMarkCompleted: () => void;
  onCancelAndBlock: () => void;
  updating?: boolean;
}) {
  if (!appointment) return null;

  const isActionable = appointment.status === 'confirmed' || appointment.status === 'in_progress';

  return (
    <BottomSheet open={open} onClose={onClose} title="Booking Details">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C2230] text-[18px] font-semibold text-[#C8A06B]">
          {appointment.customerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold text-[#F5F5F5]">
            {appointment.customerName}
          </div>
          {appointment.customerPhone && (
            <a href={`tel:${appointment.customerPhone}`} className="text-[13px] text-[#C8A06B]">
              {appointment.customerPhone}
            </a>
          )}
        </div>
      </div>

      <dl className="mt-5 flex flex-col gap-3 border-t border-[#2B3240] pt-4 text-[14px]">
        <Row label="Service" value={appointment.serviceName} />
        <Row label="Date" value={appointment.date} />
        <Row label="Time" value={formatRange12h(appointment.time, appointment.endTime)} />
        <Row label="Source" value={BOOKING_SOURCE_LABEL[appointment.bookingSource]} />
        <div className="flex items-center justify-between">
          <dt className="text-[#A7AAB4]">Status</dt>
          <dd>
            <OwnerBadge tone={appointment.status === 'completed' ? 'success' : 'warning'}>
              {appointment.status}
            </OwnerBadge>
          </dd>
        </div>
      </dl>

      {isActionable && (
        <div className="mt-6 flex flex-col gap-3">
          <OwnerButton variant="success" fullWidth loading={updating} onClick={onMarkCompleted}>
            Mark Completed
          </OwnerButton>
          <OwnerButton variant="danger" fullWidth loading={updating} onClick={onCancelAndBlock}>
            Cancel & Block Slot
          </OwnerButton>
        </div>
      )}
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#A7AAB4]">{label}</dt>
      <dd className="font-medium text-[#F5F5F5]">{value}</dd>
    </div>
  );
}

import { BottomSheet } from '@/components/owner/ui/BottomSheet';
import { OwnerButton } from '@/components/owner/ui';
import { formatRange12h } from '@/utils/scheduleTimeline';
import type { BlockedEventGroup } from '@/types/owner';

export function BlockedSlotDetailsSheet({
  group,
  open,
  onClose,
  onRelease,
  onAddBooking,
  releasing,
}: {
  group: BlockedEventGroup | null;
  open: boolean;
  onClose: () => void;
  onRelease: () => void;
  onAddBooking: () => void;
  releasing?: boolean;
}) {
  if (!group) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Blocked Slot Details">
      <div className="flex flex-col items-center pt-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2B3240] text-[22px]">
          🔒
        </div>
        <div className="mt-3 text-[15px] font-medium text-[#A7AAB4]">
          {formatRange12h(group.startTime, group.endTime)}
        </div>
        <div className="mt-1 text-[18px] font-semibold text-[#C8A06B]">Owner Blocked</div>
        <p className="mt-3 text-[13px] leading-relaxed text-[#A7AAB4]">
          This time is blocked by you. Customers cannot book this time.
        </p>
      </div>

      <dl className="mt-6 flex flex-col gap-3 border-t border-[#2B3240] pt-4 text-[14px]">
        <div className="flex items-center justify-between">
          <dt className="text-[#A7AAB4]">Reason (optional)</dt>
          <dd className="font-medium text-[#F5F5F5]">{group.reason ?? '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#A7AAB4]">Status</dt>
          <dd className="font-medium text-[#F5F5F5]">Blocked by Owner</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        <OwnerButton variant="secondary" fullWidth onClick={onAddBooking}>
          Add Booking
        </OwnerButton>
        <OwnerButton variant="primary" fullWidth loading={releasing} onClick={onRelease}>
          Release Slot
        </OwnerButton>
      </div>
    </BottomSheet>
  );
}

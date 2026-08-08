import { OwnerCard, OwnerBadge, StickyActionBar, OwnerButton } from '@/components/owner/ui';
import type { SpecialClosure } from '@/types/owner';

function formatDateBadge(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return {
    day: d.getDate(),
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export function SpecialClosuresList({
  closures,
  onAdd,
  onEdit,
  onDelete,
}: {
  closures: SpecialClosure[];
  onAdd: () => void;
  onEdit: (closure: SpecialClosure) => void;
  onDelete: (closure: SpecialClosure) => void;
}) {
  return (
    <>
      <h2 className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#6E7482]">
        Upcoming Closures
      </h2>

      {closures.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2B3240] py-10 text-center text-[14px] text-[#6E7482]">
          No upcoming closures.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {closures.map((closure) => {
          const { day, month } = formatDateBadge(closure.date);
          return (
            <OwnerCard key={closure.closureId}>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#1C2230]">
                  <span className="text-[16px] font-bold text-[#F5F5F5]">{day}</span>
                  <span className="text-[11px] text-[#A7AAB4]">{month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium text-[#F5F5F5]">{closure.label}</div>
                  <div className="mt-1">
                    <OwnerBadge tone={closure.allDay ? 'danger' : 'warning'}>
                      {closure.allDay ? 'Closed all day' : `${closure.startTime} – ${closure.endTime}`}
                    </OwnerBadge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="Edit closure"
                    onClick={() => onEdit(closure)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#A7AAB4] active:bg-[#1C2230]"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    aria-label="Delete closure"
                    onClick={() => onDelete(closure)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#E5484D] active:bg-[#1C2230]"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </OwnerCard>
          );
        })}
      </div>

      <StickyActionBar>
        <OwnerButton variant="primary" fullWidth onClick={onAdd}>
          + Add Closure
        </OwnerButton>
      </StickyActionBar>
    </>
  );
}

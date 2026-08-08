import type { SpecialClosure } from '../../../types/specialClosure.types';

interface ClosureListItemProps {
  closure: SpecialClosure;
  onEdit: (closure: SpecialClosure) => void;
  onDelete: (closure: SpecialClosure) => void;
}

function formatDate(dateStr: string): string {
  // "2026-08-20" -> "20 Aug 2026"
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime12h(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function ClosureListItem({ closure, onEdit, onDelete }: ClosureListItemProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-zinc-100">{formatDate(closure.date)}</p>

          <span className="mt-1 inline-block rounded-full border border-[#C9A278]/40 bg-[#C9A278]/10 px-2 py-0.5 text-xs font-medium text-[#C9A278]">
            {closure.type === 'full_day' ? 'Full Day' : 'Partial Day'}
          </span>

          {closure.type === 'partial_day' && closure.startTime && closure.endTime && (
            <p className="mt-1 text-sm text-zinc-400">
              {formatTime12h(closure.startTime)} – {formatTime12h(closure.endTime)}
            </p>
          )}

          {closure.reason && (
            <p className="mt-1 truncate text-sm text-zinc-500">{closure.reason}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onEdit(closure)}
            className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(closure)}
            className="rounded-md border border-red-900 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

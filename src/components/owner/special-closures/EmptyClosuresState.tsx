interface EmptyClosuresStateProps {
  onAdd: () => void;
}

// If the project already has a generic EmptyState component (per the
// existing "empty state components" noted in the customer app), swap this
// for that instead of a page-specific one-off.
export function EmptyClosuresState({ onAdd }: EmptyClosuresStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
      <p className="text-sm font-medium text-zinc-300">No special closures yet</p>
      <p className="mt-1 text-xs text-zinc-500">
        Add a one-time leave, holiday, or partial-day closure — it overrides your default
        weekly hours for that date only.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 rounded-md bg-[#C9A278] px-4 py-2 text-sm font-semibold text-zinc-950"
      >
        Add closure
      </button>
    </div>
  );
}

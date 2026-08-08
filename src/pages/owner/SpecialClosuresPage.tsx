import { useState } from 'react';

// ASSUMED IMPORTS — same as WorkingHoursSettingsPage.tsx, point at your
// actual AuthContext hook, owner layout, and toast hook.
import { useAuth } from '../../hooks/useAuth';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { useToast } from '../../hooks/useToast';

import { useSpecialClosures } from '../../hooks/useSpecialClosures';
import { ClosureListItem } from '../../components/owner/special-closures/ClosureListItem';
import { ClosureFormDialog } from '../../components/owner/special-closures/ClosureFormDialog';
import { EmptyClosuresState } from '../../components/owner/special-closures/EmptyClosuresState';
import type { SpecialClosure, SpecialClosureDraft } from '../../types/specialClosure.types';

export function SpecialClosuresPage() {
  const { user } = useAuth();
  const salonId = user?.salonId ?? '';
  const { closures, loading, error, save, remove } = useSpecialClosures(salonId);
  const { showToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SpecialClosure | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SpecialClosure | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (closure: SpecialClosure) => {
    setEditing(closure);
    setDialogOpen(true);
  };

  const handleSubmit = async (draft: SpecialClosureDraft, originalDate?: string) => {
    try {
      await save(draft, originalDate);
      showToast({ type: 'success', message: originalDate ? 'Closure updated' : 'Closure added' });
    } catch {
      showToast({ type: 'error', message: 'Could not save closure. Try again.' });
      throw new Error('save failed');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove(pendingDelete.date);
      showToast({ type: 'success', message: 'Closure removed' });
    } catch {
      showToast({ type: 'error', message: 'Could not remove closure. Try again.' });
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <OwnerLayout title="Special Closures & Holidays">
      <div className="space-y-4 px-4 pt-4 pb-8">
        {loading && <p className="text-sm text-zinc-500">Loading…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && closures.length === 0 && <EmptyClosuresState onAdd={openAdd} />}

        {!loading && closures.length > 0 && (
          <>
            <button
              type="button"
              onClick={openAdd}
              className="w-full rounded-xl border border-[#C9A278]/50 py-2.5 text-sm font-semibold text-[#C9A278]"
            >
              + Add closure
            </button>

            <div className="space-y-3">
              {closures.map((c) => (
                <ClosureListItem
                  key={c.id}
                  closure={c}
                  onEdit={openEdit}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ClosureFormDialog
        open={dialogOpen}
        salonId={salonId}
        editing={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-100">
              Remove closure for{' '}
              <span className="font-medium">{pendingDelete.date}</span>?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex-1 rounded-md border border-zinc-700 py-2 text-sm font-medium text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-semibold text-white"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}

export default SpecialClosuresPage;

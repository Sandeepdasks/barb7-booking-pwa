import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { validateClosureDraft } from '../../../utils/specialClosureValidation';
import type {
  ClosureType,
  SpecialClosure,
  SpecialClosureDraft,
} from '../../../types/specialClosure.types';

interface ClosureFormDialogProps {
  open: boolean;
  salonId: string;
  /** null = creating a new closure; provided = editing */
  editing: SpecialClosure | null;
  onClose: () => void;
  onSubmit: (draft: SpecialClosureDraft, originalDate?: string) => Promise<void>;
}

const emptyDraft = (salonId: string): SpecialClosureDraft => ({
  salonId,
  date: '',
  type: 'full_day',
  startTime: null,
  endTime: null,
  reason: null,
});

export function ClosureFormDialog({
  open,
  salonId,
  editing,
  onClose,
  onSubmit,
}: ClosureFormDialogProps) {
  const [draft, setDraft] = useState<SpecialClosureDraft>(emptyDraft(salonId));
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(
        editing
          ? {
              salonId,
              date: editing.date,
              type: editing.type,
              startTime: editing.startTime,
              endTime: editing.endTime,
              reason: editing.reason,
            }
          : emptyDraft(salonId)
      );
      setErrors([]);
    }
  }, [open, editing, salonId]);

  const setType = (type: ClosureType) => {
    setDraft((prev) => ({
      ...prev,
      type,
      startTime: type === 'full_day' ? null : prev.startTime ?? '',
      endTime: type === 'full_day' ? null : prev.endTime ?? '',
    }));
  };

  const handleSubmit = async () => {
    const result = validateClosureDraft(draft);
    setErrors(result.errors);
    if (!result.valid) return;

    setSubmitting(true);
    try {
      await onSubmit(draft, editing?.date);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-end justify-center sm:items-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <Dialog.Panel className="w-full max-w-sm rounded-t-2xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-2xl">
              <Dialog.Title className="text-base font-semibold text-zinc-100">
                {editing ? 'Edit Closure' : 'Add Closure'}
              </Dialog.Title>

              <div className="mt-4 space-y-4">
                <label className="flex flex-col gap-1 text-xs text-zinc-400">
                  Date
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType('full_day')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium ${
                      draft.type === 'full_day'
                        ? 'bg-[#C9A278] text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    Full Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('partial_day')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium ${
                      draft.type === 'partial_day'
                        ? 'bg-[#C9A278] text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    Partial Day
                  </button>
                </div>

                {draft.type === 'partial_day' && (
                  <div className="flex items-center gap-3">
                    <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
                      Start
                      <input
                        type="time"
                        value={draft.startTime ?? ''}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, startTime: e.target.value }))
                        }
                        className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
                      />
                    </label>
                    <span className="pt-4 text-zinc-600">–</span>
                    <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
                      End
                      <input
                        type="time"
                        value={draft.endTime ?? ''}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, endTime: e.target.value }))
                        }
                        className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
                      />
                    </label>
                  </div>
                )}

                <label className="flex flex-col gap-1 text-xs text-zinc-400">
                  Reason (optional)
                  <input
                    type="text"
                    value={draft.reason ?? ''}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, reason: e.target.value || null }))
                    }
                    placeholder="e.g. Family Function"
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-zinc-100"
                  />
                </label>

                {errors.length > 0 && (
                  <p className="text-xs text-red-400">{errors[0]}</p>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-zinc-700 py-2 text-sm font-medium text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 rounded-md bg-[#C9A278] py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

import { useCallback, useState } from "react";

// One selected slot per dateKey (YYYY-MM-DD). State-only for this phase —
// no backend persistence per Phase 2.2 scope. Switching tabs keeps each
// day's prior selection remembered.
export function useBookingSelection() {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const selectSlot = useCallback((dateKey: string, time24: string) => {
    setSelections((prev) => ({ ...prev, [dateKey]: time24 }));
  }, []);

  const getSelected = useCallback(
    (dateKey: string) => selections[dateKey],
    [selections]
  );

  // Used when a previously-selected slot turns out to already be taken
  // (double-booking conflict caught at confirm-time) — clears just that day.
  const clearSelection = useCallback((dateKey: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
  }, []);

  return { selections, selectSlot, getSelected, clearSelection };
}
import type { SpecialClosureDraft } from '../types/specialClosure.types';

export interface ClosureValidationResult {
  valid: boolean;
  errors: string[];
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function validateClosureDraft(draft: SpecialClosureDraft): ClosureValidationResult {
  const errors: string[] = [];

  if (!draft.date) {
    errors.push('Date is required');
  }

  if (draft.type === 'partial_day') {
    if (!draft.startTime || !draft.endTime) {
      errors.push('Start and end time are required for a partial-day closure');
    } else if (toMinutes(draft.startTime) >= toMinutes(draft.endTime)) {
      errors.push('Start time must be before end time');
    }
  }

  return { valid: errors.length === 0, errors };
}

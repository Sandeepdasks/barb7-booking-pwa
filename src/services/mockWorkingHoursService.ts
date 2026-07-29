import { WorkingHours } from '../types/workingHours';

// Mirrors the future Firestore `workingHours/{salonId}` document shape.
// Default schedule: Mon–Sat 09:00–20:00, Sun 09:00–19:00.
const MOCK_WORKING_HOURS: WorkingHours = {
  salonId: 'barb7',
  slotDurationMinutes: 30,
  monday:    { openTime: '09:00', closeTime: '20:00', isClosed: false },
  tuesday:   { openTime: '09:00', closeTime: '20:00', isClosed: false },
  wednesday: { openTime: '09:00', closeTime: '20:00', isClosed: false },
  thursday:  { openTime: '09:00', closeTime: '20:00', isClosed: false },
  friday:    { openTime: '09:00', closeTime: '20:00', isClosed: false },
  saturday:  { openTime: '09:00', closeTime: '20:00', isClosed: false },
  sunday:    { openTime: '09:00', closeTime: '19:00', isClosed: false },
  updatedAt: new Date().toISOString(),
};

// Replace with `getDoc(doc(db, 'workingHours', salonId))` when Firestore lands.
// Signature stays identical so no component refactor is needed later.
export async function fetchWorkingHours(salonId: string): Promise<WorkingHours> {
  await new Promise((resolve) => setTimeout(resolve, 250)); // simulate network
  return { ...MOCK_WORKING_HOURS, salonId };
}
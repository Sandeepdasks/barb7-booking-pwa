// Temporary mock ID — replace with a Cloud-Function-issued ID once Firestore
// booking creation lands. Format: B7-YYYYMMDD-XXXX.
export function generateMockBookingId(dateKey: string): string {
  const compact = dateKey.replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `B7-${compact}-${suffix}`;
}
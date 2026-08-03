import { ResponsiveContainer } from "../layout/ResponsiveContainer";

interface StickyBookCTAProps {
  onBook: () => void;
  onMyBookings: () => void;
  isAuthenticated: boolean;
}

// Purely presentational. Routing/auth wiring stays in the parent page —
// this component does not touch BookingPage, AuthContext, or Firestore logic.
export function StickyBookCTA({ onBook, onMyBookings, isAuthenticated }: StickyBookCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#1F2128] via-[#1F2128]/95 to-transparent pb-4 pt-6">
      <ResponsiveContainer>
        <div className="flex gap-3">
          {isAuthenticated && (
            <button
              type="button"
              onClick={onMyBookings}
              className="flex-1 rounded-[10px] bg-[#2E313C] py-3.5 text-[15px] font-semibold text-[#F5F1EA] shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition active:scale-[0.98]"
            >
              My Bookings
            </button>
          )}
          <button
            type="button"
            onClick={onBook}
            className="flex-1 rounded-[10px] bg-[#C9A278] py-3.5 text-[15px] font-semibold text-[#1F2128] transition active:scale-[0.98]"
          >
            Book Appointment
          </button>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

// Applied across Landing, Booking, My Bookings, Booking Confirmation.
// Mobile: 16px padding · Tablet: 32px · Laptop/Desktop: 48px, capped at 1200px
// and centered. Full-bleed elements (hero image, fixed CTA gradient strip)
// stay outside this container; only their inner content wraps in it.
export function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
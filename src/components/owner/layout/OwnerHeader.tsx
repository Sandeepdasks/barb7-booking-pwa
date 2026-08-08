import type { ReactNode } from 'react';

export function OwnerHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#2B3240] bg-[#0B0D12]/95 px-4 backdrop-blur"
      style={{ height: 56, paddingTop: 'env(safe-area-inset-top)' }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#F5F5F5] active:bg-[#1C2230]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-semibold text-[#F5F5F5]">{title}</h1>
        {subtitle && <p className="truncate text-[13px] text-[#A7AAB4]">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

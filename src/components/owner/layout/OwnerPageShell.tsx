import type { ReactNode } from 'react';

export function OwnerPageShell({
  header,
  children,
  footer,
}: {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0D12] font-['Inter',system-ui,sans-serif] text-[#F5F5F5]">
      {header}
      <main className="flex-1 overflow-y-auto px-4 py-4">{children}</main>
      {footer}
    </div>
  );
}

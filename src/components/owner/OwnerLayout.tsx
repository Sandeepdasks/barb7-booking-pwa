import { ReactNode } from 'react';

interface OwnerLayoutProps {
  title: string;
  children: ReactNode;
}

export function OwnerLayout({ title, children }: OwnerLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-4">
        <h1 className="text-xl font-semibold">{title}</h1>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
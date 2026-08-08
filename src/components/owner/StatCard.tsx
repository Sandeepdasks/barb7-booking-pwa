import type { FC, ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: boolean;
}

export const StatCard: FC<StatCardProps> = ({ label, value, icon, accent = false }) => (
  <div className="rounded-2xl border border-white/5 bg-[#2E313C] p-4">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-[#B8BCC8]">{label}</span>
      {icon && <span className="text-[#C9A278]">{icon}</span>}
    </div>
    <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-[#C9A278]' : 'text-[#F5F1EA]'}`}>
      {value}
    </p>
  </div>
);

import type { ReactNode } from 'react';
import { OwnerCard } from '@/components/owner/ui';

type MetricTone = 'primary' | 'warning' | 'success';

const ICON_TONE_CLASSES: Record<MetricTone, string> = {
  primary: 'text-[#C8A06B]',
  warning: 'text-[#F5B942]',
  success: 'text-[#18B979]',
};

export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  tone = 'primary',
  className = '',
}: {
  label: string;
  value: number;
  subtitle?: string;
  icon?: ReactNode;
  tone?: MetricTone;
  className?: string;
}) {
  return (
    <OwnerCard className={className}>
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#A7AAB4]">
          {label}
        </span>
        {icon && <span className={ICON_TONE_CLASSES[tone]}>{icon}</span>}
      </div>
      <div className="mt-3 text-[28px] font-bold leading-none text-[#F5F5F5]">{value}</div>
      {subtitle && <p className="mt-1 text-[12px] text-[#6E7482]">{subtitle}</p>}
    </OwnerCard>
  );
}

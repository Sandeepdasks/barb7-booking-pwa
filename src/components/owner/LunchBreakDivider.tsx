import type { FC } from 'react';
import { Coffee } from 'lucide-react';
import { LUNCH_BREAK_START, LUNCH_BREAK_END } from '../../constants/ownerBusinessRules';

export const LunchBreakDivider: FC = () => (
  <div className="flex items-center gap-3 py-2">
    <div className="h-px flex-1 bg-white/10" />
    <div className="flex items-center gap-1.5 text-xs font-medium text-[#B8BCC8]">
      <Coffee size={14} className="text-[#C9A278]" />
      Lunch Break • {LUNCH_BREAK_START} – {LUNCH_BREAK_END}
    </div>
    <div className="h-px flex-1 bg-white/10" />
  </div>
);

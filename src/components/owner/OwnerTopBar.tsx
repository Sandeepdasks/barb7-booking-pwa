import type { FC } from 'react';
import { LogOut } from 'lucide-react';

interface OwnerTopBarProps {
  salonName: string;
  onLogout: () => void;
}

export const OwnerTopBar: FC<OwnerTopBarProps> = ({ salonName, onLogout }) => (
  <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1F2128]/95 px-4 py-3 backdrop-blur">
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-[#C9A278]">Owner</p>
      <h1 className="text-lg font-semibold text-[#F5F1EA]">{salonName}</h1>
    </div>
    <button
      type="button"
      onClick={onLogout}
      aria-label="Log out"
      className="rounded-lg p-2 text-[#B8BCC8] active:bg-white/5"
    >
      <LogOut size={20} />
    </button>
  </header>
);

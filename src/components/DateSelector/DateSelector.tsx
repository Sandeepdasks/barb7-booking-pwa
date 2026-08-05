interface DateOption {
  label: string;
  date: Date;
}

interface DateSelectorProps {
  options: DateOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DateSelector({ options, selectedIndex, onSelect }: DateSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt, i) => {
        const isSelected = i === selectedIndex;
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(i)}
            className={`rounded-xl py-3 px-2 text-center transition-colors ${
              isSelected ? 'bg-[#C9A278] text-[#1F2128]' : 'bg-[#3A3E4A] text-[#F5F1EA]'
            }`}
          >
            <p className="text-[0.75rem] leading-[1.4rem] uppercase tracking-wide font-semibold">{opt.label}</p>
            <p className="text-sm mt-1 font-mono">
              {opt.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </p>
          </button>
        );
      })}
    </div>
  );
}
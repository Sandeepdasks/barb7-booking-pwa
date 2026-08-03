export type BookingTabKey = "upcoming" | "past";

interface BookingTabsProps {
  activeKey: BookingTabKey;
  onChange: (key: BookingTabKey) => void;
}

const TABS: Array<{ key: BookingTabKey; label: string }> = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export function BookingTabs({ activeKey, onChange }: BookingTabsProps) {
  return (
    <div className="flex gap-2 py-4">
      {TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-[#C9A278] text-[#1F2128]"
                : "bg-[#2E313C] text-[#B8BCC8]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
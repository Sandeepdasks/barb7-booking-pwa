import { useWorkingHours } from '../../hooks/useWorkingHours';
import { getTodayHours, formatTime12h, computeOpenStatus } from '../../utils/workingHoursUtils';

interface SalonHomeProps {
  salonId: string;
  salonName: string;
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function SalonHome({ salonId, salonName }: SalonHomeProps) {
  const { workingHours, loading, error } = useWorkingHours(salonId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2E313C] flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-3 animate-pulse">
          <div className="h-6 w-2/3 bg-[#4A4E5C] rounded" />
          <div className="h-4 w-1/2 bg-[#4A4E5C] rounded" />
          <div className="h-40 w-full bg-[#4A4E5C] rounded-2xl mt-4" />
        </div>
      </div>
    );
  }

  if (error || !workingHours) {
    return (
      <div className="min-h-screen bg-[#2E313C] flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-[#F5F1EA] text-lg font-semibold">Couldn't load salon hours.</p>
          <p className="text-[#C9A278] text-sm mt-1">Check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const todayHours = getTodayHours(workingHours);
  const status = computeOpenStatus(todayHours);

  return (
    <div className="min-h-screen bg-[#2E313C] px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-[#C9A278] flex items-center justify-center text-[#2E313C] font-bold text-lg shrink-0">
            B7
          </div>
          <div>
            <h1 className="text-[#F5F1EA] text-xl font-bold tracking-wide uppercase">{salonName}</h1>
            <p className="text-[#8B8F9C] text-xs tracking-widest uppercase">Hair · Skin · Make Up</p>
          </div>
        </div>

        <div className="relative bg-[#F5F1EA] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[#8B8F9C] text-xs uppercase tracking-widest">Today</p>
              <p className="text-[#1F2128] text-2xl font-bold font-mono mt-1">
                {todayHours.isClosed
                  ? 'Closed'
                  : `${formatTime12h(todayHours.openTime)} – ${formatTime12h(todayHours.closeTime)}`}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
                status.isOpen ? 'bg-[#7FA895] text-[#1F2128]' : 'bg-[#C77B6B] text-[#F5F1EA]'
              }`}
            >
              {status.label}
            </span>
          </div>

          <div className="relative h-0 border-t-2 border-dashed border-[#D8D2C4] mx-6">
            <span className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#2E313C]" />
            <span className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#2E313C]" />
          </div>

          <div className="px-6 py-5">
            <p className="text-[#8B8F9C] text-xs uppercase tracking-widest mb-2">Working hours</p>
            <ul className="space-y-1.5">
              {DAY_ORDER.map((day) => {
                const hours = workingHours[day];
                return (
                  <li key={day} className="flex justify-between text-sm">
                    <span className="text-[#1F2128] capitalize">{day}</span>
                    <span className="font-mono text-[#4A4E5C]">
                      {hours.isClosed
                        ? 'Closed'
                        : `${formatTime12h(hours.openTime)} – ${formatTime12h(hours.closeTime)}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p className="text-[#8B8F9C] text-xs text-center mt-6">
          Hours set by salon owner. Always shows latest schedule.
        </p>
      </div>
    </div>
  );
}
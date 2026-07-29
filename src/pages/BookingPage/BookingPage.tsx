import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkingHours } from '../../hooks/useWorkingHours';
import { DateSelector } from '../../components/DateSelector/DateSelector';
import { SlotGrid } from '../../components/SlotGrid/SlotGrid';
import { addDays, getDayKeyForDate, formatTime12h, computeOpenStatus } from '../../utils/workingHoursUtils';
import { generateSlots } from '../../utils/slotUtils';

const DATE_LABELS = ['Today', 'Tomorrow', 'Day After'];

export function BookingPage() {
  const navigate = useNavigate();
  const { workingHours, loading, error } = useWorkingHours('barb7');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const dateOptions = useMemo(
    () => DATE_LABELS.map((label, i) => ({ label, date: addDays(new Date(), i) })),
    []
  );

  const selectedDate = dateOptions[selectedDateIndex].date;
  const dayHours = workingHours ? workingHours[getDayKeyForDate(selectedDate)] : null;
  const status = dayHours ? computeOpenStatus(dayHours, selectedDate) : null;
  const slots = workingHours && dayHours ? generateSlots(dayHours, workingHours.slotDurationMinutes) : [];

  function handleSelectDate(index: number) {
    setSelectedDateIndex(index);
    setSelectedTime(null);
  }

  if (loading) {
    return <div className="min-h-screen bg-[#1F2128] flex items-center justify-center text-[#8B8F9C]">Loading…</div>;
  }

  if (error || !workingHours) {
    return (
      <div className="min-h-screen bg-[#1F2128] flex items-center justify-center px-6 text-center">
        <p className="text-[#F5F1EA]">Couldn't load booking slots. Try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F2128] pb-28">
      <div className="flex items-center gap-3 px-4 py-4 bg-[#2E313C]">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-[#F5F1EA] text-xl">
          ←
        </button>
        <h1 className="text-[#F5F1EA] text-sm font-semibold uppercase tracking-wide">BARB7 Unisex Salon</h1>
      </div>

      <div className="px-6 py-5 space-y-6">
        <DateSelector options={dateOptions} selectedIndex={selectedDateIndex} onSelect={handleSelectDate} />

        {dayHours && (
          <div className="flex items-center justify-between bg-[#2E313C] rounded-xl px-4 py-3">
            <span
              className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${
                status?.isOpen ? 'bg-[#7FA895] text-[#1F2128]' : 'bg-[#C77B6B] text-[#F5F1EA]'
              }`}
            >
              {dayHours.isClosed ? 'Closed' : status?.label}
            </span>
            {!dayHours.isClosed && (
              <span className="text-[#B8BCC8] text-sm font-mono">
                {formatTime12h(dayHours.openTime)} – {formatTime12h(dayHours.closeTime)}
              </span>
            )}
          </div>
        )}

        <div>
          <h2 className="text-[#F5F1EA] text-sm font-semibold uppercase tracking-wide mb-3">Select a time</h2>
          <SlotGrid slots={slots} selectedTime={selectedTime} onSelect={setSelectedTime} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#2E313C] px-6 py-4">
        <button
          disabled={!selectedTime}
          onClick={() => navigate('/booking/continue')}
          className="w-full bg-[#C9A278] text-[#1F2128] font-semibold uppercase tracking-wide rounded-2xl py-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
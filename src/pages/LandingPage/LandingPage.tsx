import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSalonInfo, fetchServices } from '../../services/mockSalonService';
import { useWorkingHours } from '../../hooks/useWorkingHours';
import { getTodayHours, formatTime12h, computeOpenStatus } from '../../utils/workingHoursUtils';
import { SalonInfo, ServiceItem } from '../../types/salon';

export function LandingPage() {
  const navigate = useNavigate();
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const { workingHours, loading } = useWorkingHours('barb7');

  useEffect(() => {
    fetchSalonInfo().then(setSalon);
    fetchServices().then(setServices);
  }, []);

  const todayHours = workingHours ? getTodayHours(workingHours) : null;
  const status = todayHours ? computeOpenStatus(todayHours) : null;

  return (
    <div className="min-h-screen bg-[#1F2128]">
      {/* Hero */}
      <div className="relative h-[36vh] min-h-[280px] bg-gradient-to-br from-[#2E313C] via-[#23262F] to-[#1A1C22] px-6 pt-6 pb-8 flex flex-col justify-between overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#C9A278]/10 blur-3xl" />

        <div className="flex items-start justify-between relative z-10">
          <div className="w-12 h-12 rounded-full bg-[#C9A278] flex items-center justify-center text-[#1F2128] font-bold">
            B7
          </div>
          <button aria-label="Share" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#F5F1EA]">
            ⤴
          </button>
        </div>

        <div className="relative z-10">
          <h1 className="text-[#F5F1EA] text-2xl font-bold uppercase tracking-wide">
            {salon?.name ?? 'BARB7 UNISEX SALON'}
          </h1>
          <p className="text-[#C9A278] text-sm mt-1">{salon?.tagline ?? 'Premium Grooming Experience'}</p>

          <div className="flex items-center gap-3 mt-3 text-xs text-[#B8BCC8]">
            <span className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 text-[#F5F1EA]">
              ★ {salon?.rating ?? '4.9'}
            </span>
            <span className="truncate">{salon?.address ?? 'Kochi, Kerala'}</span>
          </div>
          <p className="text-xs text-[#B8BCC8] mt-1">{salon?.phone}</p>
        </div>
      </div>

      {/* Quick info chips */}
      <div className="px-6 -mt-4 relative z-10">
        <div className="flex flex-wrap gap-2">
          {['Hair', 'Beard', 'Skin', 'Makeup'].map((chip) => (
            <span key={chip} className="bg-[#2E313C] text-[#F5F1EA] text-xs px-3 py-1.5 rounded-full">
              {chip}
            </span>
          ))}
          {status && (
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                status.isOpen ? 'bg-[#7FA895] text-[#1F2128]' : 'bg-[#C77B6B] text-[#F5F1EA]'
              }`}
            >
              {status.isOpen ? 'Open Today' : status.label}
            </span>
          )}
          {todayHours && !todayHours.isClosed && (
            <span className="bg-[#3A3E4A] text-[#F5F1EA] text-xs px-3 py-1.5 rounded-full font-mono">
              {formatTime12h(todayHours.openTime)} – {formatTime12h(todayHours.closeTime)}
            </span>
          )}
        </div>
      </div>

      {/* About */}
      <div className="px-6 mt-6">
        <h2 className="text-[#F5F1EA] text-sm font-semibold uppercase tracking-wide mb-2">About</h2>
        <p className="text-[#B8BCC8] text-sm leading-relaxed">{salon?.about}</p>
      </div>

      {/* Services preview */}
      <div className="mt-6">
        <h2 className="text-[#F5F1EA] text-sm font-semibold uppercase tracking-wide mb-3 px-6">Services</h2>
        <div className="flex gap-3 overflow-x-auto px-6 pb-2">
          {services.map((svc) => (
            <div key={svc.id} className="shrink-0 w-32 bg-[#2E313C] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">{svc.icon}</div>
              <p className="text-[#F5F1EA] text-sm font-medium">{svc.name}</p>
              <p className="text-[#8B8F9C] text-xs mt-1 font-mono">{svc.durationMinutes} min</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 mt-8 pb-10">
        <button
          onClick={() => navigate('/booking')}
          disabled={loading}
          className="w-full bg-[#C9A278] text-[#1F2128] font-semibold uppercase tracking-wide rounded-2xl py-4 disabled:opacity-50"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
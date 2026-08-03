import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { TermsCheckbox } from "./TermsCheckbox";
import { BookingSummaryCard } from "./BookingSummaryCard";

export interface ContactDetailsSubmitPayload {
  customerName: string;
  customerPhone: string;
}

interface ContactDetailsModalProps {
  open: boolean;
  defaultName: string;
  email: string | null; // from Google sign-in — read-only display
  salonName: string;
  dateLabel: string;
  timeLabel: string; // start time only, e.g. "7:00 PM"
  servicesLabel: string; // already-chosen services, read-only recap
  onClose: () => void;
  onSubmit: (payload: ContactDetailsSubmitPayload) => void;
}

const MOBILE_REGEX = /^\d{10}$/;

// Service selection MOVED OUT of this modal (Priority 5): durations must be
// known before time slots can be filtered, so services are now picked on the
// booking page before the slot grid. This modal only shows them back as a
// read-only recap.
export function ContactDetailsModal({
  open,
  defaultName,
  email,
  salonName,
  dateLabel,
  timeLabel,
  servicesLabel,
  onClose,
  onSubmit,
}: ContactDetailsModalProps) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  const isPhoneValid = MOBILE_REGEX.test(phone);
  const canSubmit = useMemo(
    () => name.trim().length > 0 && isPhoneValid && agreed,
    [name, isPhoneValid, agreed]
  );

  if (!open) return null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ customerName: name.trim(), customerPhone: phone });
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-sm animate-[modalIn_180ms_ease-out] flex-col rounded-[24px] bg-[#2E313C] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#1F2128]/60 text-[#B8BCC8] transition hover:text-[#F5F1EA]"
        >
          <X size={16} />
        </button>

        <div className="flex-1 overflow-y-auto px-6 pt-6">
          <h2 className="mb-4 pr-10 text-lg font-bold text-[#F5F1EA]">
            Contact Details
          </h2>
          <BookingSummaryCard
            salonName={salonName}
            dateLabel={dateLabel}
            timeLabel={timeLabel}
          />

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#B8BCC8]">
                Services
              </label>
              <p className="rounded-xl border border-[#F5F1EA]/10 bg-[#1F2128]/60 px-3.5 py-3 text-sm text-[#B8BCC8]">
                {servicesLabel}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#B8BCC8]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-[#F5F1EA]/10 bg-[#1F2128] px-3.5 py-3 text-sm text-[#F5F1EA] placeholder:text-[#B8BCC8]/50 focus:border-[#C9A278] focus:outline-none"
              />
            </div>

            {email && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#B8BCC8]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-[#F5F1EA]/10 bg-[#1F2128]/60 px-3.5 py-3 text-sm text-[#B8BCC8]"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#B8BCC8]">
                Mobile Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border border-[#F5F1EA]/10 bg-[#1F2128] px-3.5 py-3 text-sm text-[#F5F1EA] placeholder:text-[#B8BCC8]/50 focus:border-[#C9A278] focus:outline-none"
              />
              {phone.length > 0 && !isPhoneValid && (
                <p className="mt-1 text-xs text-red-400">Enter a valid 10-digit number.</p>
              )}
            </div>

            <TermsCheckbox checked={agreed} onChange={setAgreed} />
          </div>
        </div>

        <div className="rounded-b-[24px] bg-[#2E313C] px-6 pb-6 pt-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full rounded-[10px] py-3 text-sm font-semibold transition ${
              canSubmit
                ? "bg-[#C9A278] text-[#1F2128] shadow-[0_8px_20px_rgba(201,162,120,0.35)]"
                : "bg-[#1F2128] text-[#B8BCC8]/40 cursor-not-allowed"
            }`}
          >
            Review Booking
          </button>
        </div>
      </div>
    </div>
  );
}
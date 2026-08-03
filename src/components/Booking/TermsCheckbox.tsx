import { useState } from "react";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function TermsCheckbox({ checked, onChange }: TermsCheckboxProps) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <label className="flex items-center gap-2 text-sm text-[#B8BCC8]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-[#F5F1EA]/20 accent-[#C9A278]"
        />
        <span>
          I agree to the{" "}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="font-medium text-[#C9A278] underline underline-offset-2"
          >
            Terms &amp; Conditions
          </button>
        </span>
      </label>

      {showTerms && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#2E313C] p-5 text-sm text-[#B8BCC8]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold text-[#F5F1EA]">
              Terms &amp; Conditions
            </h3>
            <p>Placeholder — full terms content coming in a future phase.</p>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="mt-4 w-full rounded-xl bg-[#C9A278] py-2 font-semibold text-[#1F2128]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
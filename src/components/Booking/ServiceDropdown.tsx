import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Service } from "../../types/salon";

interface ServiceDropdownProps {
  services: Service[];
  value: string[]; // selected service ids — multi-select
  onChange: (serviceIds: string[]) => void;
}

// ROOT CAUSE of the "dropdown renders underneath Cancel/Confirm" bug: the panel
// was `position: absolute` inside the modal body's `overflow-y-auto` scroll
// container, which clips any child that would overflow it — no z-index value
// can fix a clipping ancestor. Fix: render the panel via a portal into
// document.body as `position: fixed`, positioned from the trigger button's
// live getBoundingClientRect(). This floats it above the sticky footer
// regardless of the modal's scroll/stacking context, and behaves the same on
// mobile Safari and Chrome since it no longer depends on any ancestor's
// overflow settings.
export function ServiceDropdown({ services, value, onChange }: ServiceDropdownProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updateRect = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const selectedNames = services.filter((s) => value.includes(s.id)).map((s) => s.name);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="w-full truncate rounded-xl border border-[#F5F1EA]/10 bg-[#1F2128] px-3.5 py-3 text-left text-sm text-[#F5F1EA] focus:border-[#C9A278] focus:outline-none"
      >
        {selectedNames.length > 0 ? selectedNames.join(", ") : "Select services"}
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
            className="z-[999] max-h-52 overflow-y-auto rounded-xl border border-[#F5F1EA]/10 bg-[#1F2128] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
          >
            {services.map((service) => {
              const checked = value.includes(service.id);
              return (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[#F5F1EA] hover:bg-[#2E313C]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(service.id)}
                    className="h-4 w-4 rounded border-[#F5F1EA]/20 accent-[#C9A278]"
                  />
                  {service.name}
                </label>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
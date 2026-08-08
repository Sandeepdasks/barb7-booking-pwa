import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  note?: string; // small muted trailing label, e.g. "Booked"
}

// Shared trigger + panel styling for Service and Time fields — same height/radius/background/
// chevron spacing across both, and (unlike native <select>/<input type="time">) the panel is
// guaranteed to match the trigger's width exactly since it's anchored via `relative` + `w-full`,
// not browser/OS-rendered.
export function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder: string;
  disabled?: boolean;
}) {
  const selected = options.find((o) => o.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Button
          className={[
            'flex h-12 w-full items-center justify-between rounded-xl border border-[#2B3240] bg-[#1C2230]',
            'pl-3 pr-4 text-left text-[15px] text-[#F5F5F5]',
            'focus:outline-none focus:border-[#C8A06B]',
            disabled ? 'opacity-40' : '',
          ].join(' ')}
        >
          <span className={selected ? 'truncate' : 'truncate text-[#6E7482]'}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown size={18} strokeWidth={2} className="ml-2 shrink-0 text-[#F5F5F5]" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={[
              'absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[280px] overflow-y-auto',
              'rounded-xl border border-[#2B3240] bg-[#1C2230] py-1 shadow-lg shadow-black/40',
              'focus:outline-none',
            ].join(' ')}
          >
            {options.length === 0 && (
              <div className="px-3 py-3 text-[13px] text-[#6E7482]">No options available.</div>
            )}
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={({ active, disabled: optDisabled }) =>
                  [
                    'flex cursor-pointer items-center justify-between px-3 py-2.5 text-[14px]',
                    optDisabled ? 'cursor-not-allowed text-[#6E7482]' : 'text-[#F5F5F5]',
                    active && !optDisabled ? 'bg-[#2B3240]' : '',
                  ].join(' ')
                }
              >
                {({ selected: isSelected }) => (
                  <>
                    <span className={isSelected ? 'font-semibold text-[#C8A06B]' : ''}>{option.label}</span>
                    {option.note && <span className="text-[12px] text-[#6E7482]">{option.note}</span>}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

import { Fragment } from 'react';

import {
  Listbox,
  Transition,
} from '@headlessui/react';

import {
  ChevronDown,
} from 'lucide-react';

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  note?: string;
}

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
  const selected = options.find(
    (option) =>
      option.value === value
  );

  function handleChange(
    nextValue: string
  ) {
    onChange(nextValue);
  }

  return (
    <Listbox
      value={value}
      onChange={handleChange}
      disabled={disabled}
    >
      {({ open }) => (
        <div className="relative w-full">
          <Listbox.Button
            className={[
              'flex h-12 w-full items-center justify-between rounded-xl border border-[#2B3240] bg-[#1C2230]',
              'pl-3 pr-4 text-left text-[15px] text-[#F5F5F5]',
              'focus:border-[#C8A06B] focus:outline-none',
              disabled
                ? 'cursor-not-allowed opacity-40'
                : '',
            ].join(' ')}
          >
            <span
              className={
                selected
                  ? 'truncate'
                  : 'truncate text-[#6E7482]'
              }
            >
              {selected?.label ??
                placeholder}
            </span>

            <ChevronDown
              size={18}
              strokeWidth={2}
              className={[
                'ml-3 shrink-0 text-[#F5F5F5] transition-transform duration-150',
                open
                  ? 'rotate-180'
                  : '',
              ].join(' ')}
            />
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Listbox.Options
              className={[
                'absolute left-0 right-0 top-full z-30 mt-1.5',
                'max-h-[280px] w-full overflow-y-auto',
                'rounded-xl border border-[#2B3240] bg-[#1C2230] py-1',
                'shadow-lg shadow-black/40',
                'focus:outline-none',
              ].join(' ')}
            >
              {options.length === 0 && (
                <div className="px-3 py-3 text-[13px] text-[#6E7482]">
                  No options available.
                </div>
              )}

              {options.map(
                (option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={({
                      active,
                      disabled:
                        optionDisabled,
                    }) =>
                      [
                        'flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-[14px]',
                        optionDisabled
                          ? 'cursor-not-allowed text-[#6E7482]'
                          : 'text-[#F5F5F5]',
                        active &&
                        !optionDisabled
                          ? 'bg-[#2B3240]'
                          : '',
                      ].join(' ')
                    }
                  >
                    {({
                      selected:
                        isSelected,
                    }) => (
                      <>
                        <span
                          className={[
                            'truncate',
                            isSelected
                              ? 'font-semibold text-[#C8A06B]'
                              : '',
                          ].join(' ')}
                        >
                          {
                            option.label
                          }
                        </span>

                        {option.note && (
                          <span className="shrink-0 text-[12px] text-[#6E7482]">
                            {
                              option.note
                            }
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                )
              )}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
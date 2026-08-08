import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

// --- Button -----------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-[#C8A06B] text-[#0B0D12] active:bg-[#A88354]',
  secondary: 'bg-[#1C2230] text-[#F5F5F5] border border-[#2B3240] active:bg-[#151922]',
  danger: 'bg-[#E5484D] text-[#F5F5F5] active:opacity-90',
  success: 'bg-[#18B979] text-[#0B0D12] active:opacity-90',
  ghost: 'bg-transparent text-[#A7AAB4] active:bg-[#1C2230]',
};

interface OwnerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  /** Override the default h-14 height, e.g. "h-[3.2rem]". Existing callers unaffected. */
  heightClassName?: string;
}

export function OwnerButton({
  variant = 'primary',
  fullWidth,
  loading,
  disabled,
  heightClassName = 'h-14',
  className = '',
  children,
  ...rest
}: OwnerButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        heightClassName,
        'rounded-2xl px-6 text-[15px] font-semibold transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : '',
        BUTTON_VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}

// --- Card ---------------------------------------------------------------

export function OwnerCard({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-[20px] border border-[#2B3240] bg-[#151922] p-4',
        onClick ? 'cursor-pointer transition-colors duration-150 active:bg-[#1C2230]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// --- Toggle (switch) ------------------------------------------------------

export function OwnerToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40',
        checked ? 'bg-[#C8A06B]' : 'bg-[#2B3240]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-6 w-6 rounded-full bg-[#F5F5F5] transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}

// --- Time input -------------------------------------------------------

export function OwnerTimeInput({
  value,
  onChange,
  disabled,
  ...rest
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  return (
    <input
      type="time"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={[
        'h-11 rounded-xl border border-[#2B3240] bg-[#1C2230] px-3 text-[15px] text-[#F5F5F5]',
        'disabled:opacity-40 focus:outline-none focus:border-[#C8A06B]',
      ].join(' ')}
      {...rest}
    />
  );
}

// --- Badge / status pill -----------------------------------------------------

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-[#18B979]/15 text-[#18B979]',
  warning: 'bg-[#F5B942]/15 text-[#F5B942]',
  danger: 'bg-[#E5484D]/15 text-[#E5484D]',
  neutral: 'bg-[#2B3240]/60 text-[#A7AAB4]',
  primary: 'bg-[#C8A06B]/15 text-[#C8A06B]',
};

export function OwnerBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

// --- Sticky action bar (bottom, safe-area aware) -------------------------

export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky bottom-0 left-0 right-0 border-t border-[#2B3240] bg-[#0B0D12]/95 px-4 pt-3 backdrop-blur"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      {children}
    </div>
  );
}

// --- Spinner ----------------------------------------------------------

export function OwnerSpinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-[#C8A06B] border-t-transparent ${className}`}
    />
  );
}

// Design tokens — from BARB7 Owner Portal HiFi design (single source of truth for UI).
// Used as Tailwind arbitrary values (e.g. bg-[#0B0D12]) throughout owner/ components,
// so no tailwind.config.ts edits are required to integrate this into the existing project.

export const OWNER_COLORS = {
  background: '#0B0D12',
  surface: '#151922',
  surfaceElevated: '#1C2230',
  primary: '#C8A06B',
  primaryPressed: '#A88354',
  success: '#18B979',
  warning: '#F5B942',
  danger: '#E5484D',
  border: '#2B3240',
  textPrimary: '#F5F5F5',
  textSecondary: '#A7AAB4',
  textMuted: '#6E7482',
} as const;

export const OWNER_RADIUS = {
  card: 'rounded-[20px]',
  control: 'rounded-2xl', // 16px
};

// Assumes 'Inter' is already loaded globally by the existing project (index.html / font-face).
export const OWNER_FONT_CLASS = 'font-["Inter",system-ui,sans-serif]';

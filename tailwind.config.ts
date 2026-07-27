import type { Config } from 'tailwindcss';

// Design tokens placeholder — align with Logo_colours_typography.png
// during Phase 1 wireframe pass. No component classes defined yet.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8A7052', // sampled placeholder from BARB7 signage tan
          dark: '#3A3E45',    // sampled placeholder from signage charcoal
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

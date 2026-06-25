import type { Config } from 'tailwindcss';

/** Tailwind config for the JeevanSetu web app. */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f766e',
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        critical: '#b91c1c',
        high: '#ea580c',
        moderate: '#ca8a04',
        low: '#16a34a',
      },
    },
  },
  plugins: [],
};

export default config;

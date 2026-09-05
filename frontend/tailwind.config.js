/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm "plateau green" ink scale — deep, travel-book dark.
        ink: {
          50: '#f2f6f4',
          100: '#dde9e3',
          200: '#bcd3c9',
          300: '#94b6a8',
          400: '#689788',
          500: '#4a7b6c',
          600: '#396156',
          700: '#304f48',
          800: '#29413c',
          900: '#1d302c',
          950: '#0d1a17',
        },
        // Primary travel accent — deep emerald "safari green".
        safari: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Warm amber/gold accent — sunset, temples, hospitality.
        sunset: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Terracotta secondary accent — coastal clay, warmth.
        clay: {
          400: '#e08a6a',
          500: '#c96f4e',
          600: '#a85237',
          700: '#8a4028',
        },
        // Warm off-white text & surfaces.
        cream: '#f5f0e6',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        'hero-fade':
          'radial-gradient(120% 90% at 50% 0%, rgba(16,185,129,0.18) 0%, rgba(13,26,23,0) 55%), linear-gradient(180deg, rgba(13,26,23,0) 0%, #0d1a17 92%)',
      },
      animation: {
        'ken-burns': 'kenBurns 22s ease-in-out infinite alternate',
        'fade-up': 'fadeUp 0.7s ease-out both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
      },
      keyframes: {
        kenBurns: {
          '0%': { transform: 'scale(1) translateY(0)' },
          '100%': { transform: 'scale(1.08) translateY(-1.5%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
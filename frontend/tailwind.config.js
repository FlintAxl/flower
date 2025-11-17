/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          dark: '#0f0f10',
          soft: '#151518',
        },
        ink: {
          DEFAULT: '#e8e0d9',
          muted: '#cfc5bd',
          deep: '#a39488',
        },
        rose: {
          light: '#F7CAC9',
          DEFAULT: '#D7A59A',
          deep: '#b8877c',
        },
        sand: {
          light: '#FFF8F5',
          DEFAULT: '#F5EBDD',
          deep: '#E9DBC8',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-10px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out forwards',
        slideIn: 'slideIn 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
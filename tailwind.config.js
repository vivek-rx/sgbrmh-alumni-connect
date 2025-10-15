/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ea580c', // orange-600
          light: '#fb923c',   // orange-400
          dark: '#c2410c',    // orange-700
        },
        secondary: {
          DEFAULT: '#991b1b', // red-800
          light: '#dc2626',   // red-600
          dark: '#7f1d1d',    // red-900
        },
        accent: {
          DEFAULT: '#eab308', // yellow-500
          light: '#fbbf24',   // yellow-400
          dark: '#ca8a04',    // yellow-600
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      perspective: {
        '1000': '1000px',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}

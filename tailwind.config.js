/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316', // orange-500
          light: '#fed7aa',   // orange-200
          dark: '#ea580c',    // orange-600
        },
      },
    },
  },
  plugins: [],
}

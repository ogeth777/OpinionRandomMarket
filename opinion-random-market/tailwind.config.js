/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'opinion-orange': '#FF5500', // Approx vibrant orange from screenshot
        'opinion-black': '#000000',  // Pure black bg
        'opinion-card': '#0A0A0A',   // Slightly lighter card bg
      },
      animation: {
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0) scale(1.1)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0) scale(1.1)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0) scale(1.1)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0) scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
}

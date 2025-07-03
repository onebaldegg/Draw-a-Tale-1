/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'draw-primary': '#6366f1',
        'draw-secondary': '#f59e0b',
        'draw-accent': '#10b981',
        'draw-soft': '#6366f1',
        'draw-dark': '#1f2937',
      },
      fontFamily: {
        'child-friendly': ['Comic Sans MS', 'cursive'],
        'clean': ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-soft': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
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
        'draw-soft': '#f3f4f6',
        'draw-dark': '#1f2937',
      },
      fontFamily: {
        'child-friendly': ['Comic Sans MS', 'cursive'],
        'clean': ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-soft': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}
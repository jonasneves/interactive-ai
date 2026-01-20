/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.jsx",
    "./**/*.jsx",
  ],
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'pulseGlow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

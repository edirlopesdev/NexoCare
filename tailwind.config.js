/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'tab-bg': '#F4F4F5', // Adicionando a cor personalizada
      },
      width: {
        'icon-collapsed': '24px',
        'icon-expanded': '20px',
      },
      height: {
        'icon-collapsed': '24px',
        'icon-expanded': '20px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

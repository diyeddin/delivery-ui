/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'creme': '#FDFBF7',
        'onyx': '#1A1A1A', // Rich dark charcoal
        'gold': {
          400: '#F3E5AB', // Champagne
          500: '#D4AF37', // Metallic Gold
          600: '#B8860B', // Dark Goldenrod
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Merriweather', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(to right, #D4AF37, #F3E5AB, #D4AF37)',
      }
    },
  },
  plugins: [],
}
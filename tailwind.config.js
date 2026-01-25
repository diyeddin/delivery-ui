/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The new background base
        cream: {
          50: '#FDFBF7', // The main background (Warm White)
          100: '#F5F2EA', // Secondary background
          200: '#EBE5D5', // Borders
        },
        // High contrast text (Soft Black/Charcoal)
        charcoal: {
          900: '#1C1917', // Main text
          800: '#292524', // Secondary text
          600: '#57534E', // Muted text
        },
        // Refined Gold (Darker to be visible on cream)
        gold: {
          400: '#D4AF37', // Standard Gold
          500: '#B5962F', // Darker Gold (for text)
          600: '#8F7520', // Deep Gold (borders)
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // Essential for this look
      }
    },
  },
  plugins: [],
}
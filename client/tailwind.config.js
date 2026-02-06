/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple Fitness inspired colors
        primary: '#FA114F',
        secondary: '#92E82A',
        tertiary: '#00D9FF',

        // Muscle group colors
        perna: '#FA114F',
        peito: '#FF6B35',
        costas: '#92E82A',
        ombro: '#00D9FF',
        braco: '#BF5AF2',
        cardio: '#FFD60A',

        // Dark theme
        background: '#000000',
        surface: '#1C1C1E',
        'surface-light': '#2C2C2E',
        'text-primary': '#FFFFFF',
        'text-secondary': '#98989D',
      },
    },
  },
  plugins: [],
}

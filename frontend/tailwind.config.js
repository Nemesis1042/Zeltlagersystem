/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0B132B',
        gold: '#C5A059',
      }
    },
  },
  plugins: [],
}

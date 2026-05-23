/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./registration.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#001f3f",
          light: "#003d7a",
        },
        gold: {
          DEFAULT: "#d4af37",
          dark: "#c9a227",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          800: "#1e293b",
        },
      },
      boxShadow: {
        noble: "0 4px 6px rgba(0, 31, 63, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}

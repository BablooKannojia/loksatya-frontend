// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff0000",
          dark: "#b3121a",
          light: "#fff3f3",
        },
        ink: {
          DEFAULT: "#161616",
          soft: "#4a4a4a",
        },
      },
      fontFamily: {
        devanagari: [
          '"Noto Sans Devanagari"',
          '"Mukta"',
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        livepulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(238,28,37,0.55)" },
          "70%": { boxShadow: "0 0 0 6px rgba(238,28,37,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(238,28,37,0)" },
        },
      },
      animation: {
        livepulse: "livepulse 1.8s infinite",
      },
    },
  },
  plugins: [],
};
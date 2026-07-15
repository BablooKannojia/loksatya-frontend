// tailwind.config.js
//
// Agar project mein pehle se tailwind.config.js hai, to sirf yeh 3 cheezein
// apni file ke `theme.extend` mein merge kar dena:
//   1. colors.brand   → poori site mein red color sirf yahin se control hoga
//   2. fontFamily.devanagari
//   3. keyframes/animation.livepulse (top-strip wale dot ke liye)

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
        // 👉 Poori site ka brand red sirf yahan se change hoga.
        // Har jagah bg-brand / text-brand / border-brand use karna,
        // hex code kahin bhi hardcode mat karna.
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
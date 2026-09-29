/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4f9",
          100: "#dbe4f0",
          200: "#b9cbe0",
          300: "#8ba9c9",
          400: "#5980ab",
          500: "#3c6190",
          600: "#2c4a73",
          700: "#243c5e",
          800: "#1e3150",
          900: "#0f1c30",
          950: "#0a1220",
        },
        saffron: {
          50: "#fff8ed",
          100: "#ffefd1",
          200: "#ffdca3",
          300: "#ffc26a",
          400: "#ff9f2e",
          500: "#fd7e0f",
          600: "#e0620a",
          700: "#b8480c",
          800: "#933a11",
          900: "#783211",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

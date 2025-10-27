/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Main Brand Colors
        olive: {
          50: "#f8faf4",
          100: "#f1f4e7",
          200: "#e2e9cf",
          300: "#d4de95", // Light olive (main accent)
          400: "#c5d17b",
          500: "#b6c461",
          600: "#a5b547",
          700: "#8fa03a",
          800: "#7a8542", // Medium olive
          900: "#636b2f", // Primary olive
          950: "#3d4126", // Dark olive
        },
        // Background Colors
        bg: {
          primary: "#1a1d14", // Main dark background
          secondary: "#242820", // Slightly lighter background
          overlay: "#0a0c08", // Modal/card backgrounds
          accent: "#3d4126", // Loading screen background
        },
        // Text Colors
        text: {
          primary: "#E9F8D2", // Bright white-green for headings
          secondary: "#d4de95", // Light olive for important text
          muted: "#b9c096", // Muted olive for body text
          inverse: "#000000", // Black text for light backgrounds
        },
        // Utility Colors
        accent: {
          light: "#b2bb7d", // Close button background
          medium: "#9ca66a", // Close button hover
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};

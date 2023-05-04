/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
    fontFamily: {
      sans: [
        "Averta-Regular",
        "Helvetica Neue",
        "Helvetica",
        "Arial",
        "sans-serif",
      ],
      tagline: [
        "Averta-ExtraBoldItalic",
        "Helvetica Neue",
        "Helvetica",
        "Arial",
        "sans-serif",
      ],
      heading: [
        "Averta-Bold",
        "Helvetica Neue",
        "Helvetica",
        "Arial",
        "sans-serif",
      ],
    },
  },
  plugins: [],
};

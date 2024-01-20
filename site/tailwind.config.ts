import type { Config } from "tailwindcss";

const config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  prefix: "",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
      },
    },
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
} satisfies Config;

export default config;

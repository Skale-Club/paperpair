import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf9f6", // Off-white sand
        foreground: "#0f172a", // Deep navy for text
        primary: "#6c7b4e", // Pearly olive base
        secondary: "#9fbf7a", // Pearly olive highlight
        accent: "#3f4a2d", // Deep olive shadow
        sand: {
          50: "#fdfdfc",
          100: "#faf9f6",
          200: "#f3f0e8",
          300: "#eae4d4",
          400: "#dcd3bc",
          500: "#cfc1a3",
          600: "#bca983",
          700: "#a68f64",
          800: "#8c764e",
          900: "#73603d",
          950: "#5c4c31"
        }
      }
    }
  },
  plugins: []
};

export default config;

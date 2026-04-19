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
        },
        navy: {
          DEFAULT: "#0f172a",
          50: "#f1f5f9",
          100: "#e2e8f0",
          200: "#cbd5e1",
          300: "#94a3b8",
          400: "#64748b",
          500: "#475569",
          600: "#334155",
          700: "#1e293b",
          800: "#162033",
          900: "#0f172a",
          950: "#060a14"
        },
        olive: {
          DEFAULT: "#6c7b4e",
          50: "#f4f6ef",
          100: "#e7ecd9",
          200: "#cfd8b3",
          300: "#b0bf83",
          400: "#9fbf7a",
          500: "#82a05d",
          600: "#6c7b4e",
          700: "#55623d",
          800: "#3f4a2d",
          900: "#2c331f"
        }
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f4f2ed",
        paper: "#faf8f4",
        ink: "#0e0e0e",
        dim: "#6c6a64",
        faint: "#d8d5cd",
        line: "#0e0e0e",
        accent: "#a64b2a",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

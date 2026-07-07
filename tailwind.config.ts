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
        // Mastercard-inspired palette
        canvas: "#F3F0EE",
        lifted: "#FCFBFA",
        white: "#FFFFFF",
        ink: "#141413",
        charcoal: "#262627",
        slate: "#696969",
        granite: "#555555",
        dust: "#D1CDC7",
        signal: "#CF4500",
        "light-signal": "#F37338",
        clay: "#9A3A0A",
        "link-blue": "#3860BE",
        ghost: "#E8E2DA",
        // Legacy aliases (map old names to new values)
        bg: "#F3F0EE",
        paper: "#FCFBFA",
        dim: "#696969",
        faint: "#D1CDC7",
        line: "#141413",
        accent: "#CF4500",
      },
      fontFamily: {
        sans: ["var(--font-sofia-sans)", "Arial", "sans-serif"],
        display: ["var(--font-sofia-sans)", "Arial", "sans-serif"],
        serif: ["var(--font-sofia-sans)", "Arial", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
        stadium: "40px",
        button: "20px",
      },
      boxShadow: {
        nav: "rgba(0, 0, 0, 0.04) 0px 4px 24px 0px",
        card: "rgba(0, 0, 0, 0.08) 0px 24px 48px 0px",
        drama: "rgba(0, 0, 0, 0.25) 0px 70px 110px 0px",
      },
    },
  },
  plugins: [],
};

export default config;

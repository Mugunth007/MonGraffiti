import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-warm-canvas)",
        foreground: "var(--color-carbon-black)",
        "carbon-black": "#000000",
        "paper-white": "#ffffff",
        "warm-canvas": "#e5e5e5",
        "mist-gray": "#f3f3f3",
        ash: "#c6c6c6",
        smoke: "#979797",
        slate: "#444444",
        graphite: "#2f2f2f",
        "mint-chip": "#d1ffca",
        "voltage-yellow": "#fff100",
      },
      fontFamily: {
        display: ["var(--font-anton)", "Anton", "Bebas Neue", "Barlow Condensed", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        "btn": "8px",
        "card": "24px",
        "card-lg": "32px",
        "pill": "48px",
        "tag": "64px",
      },
      spacing: {
        "nav-height": "8rem",
      },
    },
  },
  plugins: [],
};
export default config;

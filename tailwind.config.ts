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
        bg:        "#1a0f07",
        surface:   "#231508",
        surface2:  "#2e1c0a",
        surface3:  "#3a230d",
        gold:      "#c99e4c",
        goldLight: "#e8c97a",
        cream:     "#f5ead8",
        green:     "#4a7c59",
        red:       "#c0392b",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

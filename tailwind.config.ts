import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "wordle-green": "#6aaa64",
        "wordle-yellow": "#c9b458",
        "wordle-gray": "#787c7e",
        "connections-yellow": "#f9df6d",
        "connections-green": "#a0c35a",
        "connections-blue": "#b4d8fb",
        "connections-purple": "#ba81c5",
        "spelling-bee-yellow": "#f7da21",
      },
      fontFamily: {
        "nyt-franklin": [
          "nyt-franklin",
          "franklin-gothic-medium",
          "Arial",
          "sans-serif",
        ],
        "nyt-karnak": [
          "nyt-karnakcondensed",
          "cheltenham",
          "Georgia",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;

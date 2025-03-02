import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Ensures Tailwind scans all files
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

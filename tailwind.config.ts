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
        light: {
          canvas: '#F4F5F7',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F8FAFC',
        },
        brand: {
          blue: '#2563EB',
          darkBlue: '#1D4ED8',
          accentBlue: '#0052FF',
          dark: '#0F172A',
          cardDark: '#111827',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f8fafc",
          100: "#e2e8f0",
          500: "#0f766e",
          700: "#115e59",
          900: "#042f2e"
        }
      },
      boxShadow: {
        soft: "0 10px 25px -10px rgba(15, 118, 110, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;

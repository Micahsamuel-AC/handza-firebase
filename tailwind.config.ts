import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:        "#1B3A6B",
        "navy-dark": "#0F2347",
        "navy-light":"#E8EDF5",
        handza:      "#E8541A",
        "handza-dark":"#C94210",
        "handza-light":"#FFF0E8",
        lgray:       "#F4F6FB",
        success:     "#10b981",
      },
      fontFamily: {
        heading: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        sans:    ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        sm:     "0 1px 3px rgba(27,58,107,0.08), 0 1px 2px rgba(27,58,107,0.04)",
        md:     "0 4px 16px rgba(27,58,107,0.10), 0 2px 6px rgba(27,58,107,0.06)",
        lg:     "0 12px 40px rgba(27,58,107,0.12), 0 4px 12px rgba(27,58,107,0.08)",
        orange: "0 8px 24px rgba(232,84,26,0.28)",
        "orange-lg": "0 12px 32px rgba(232,84,26,0.38)",
      },
      animation: {
        "fade-up":   "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards",
        "fade-in":   "fadeIn 0.4s ease forwards",
        "float":     "float 3s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
      },
      keyframes: {
        fadeUp:   { from: { opacity:"0", transform:"translateY(24px)" }, to: { opacity:"1", transform:"translateY(0)" } },
        fadeIn:   { from: { opacity:"0" }, to: { opacity:"1" } },
        float:    { "0%,100%": { transform:"translateY(0)" }, "50%": { transform:"translateY(-8px)" } },
        "pulse-dot": { "0%,100%": { opacity:"1", transform:"scale(1)" }, "50%": { opacity:"0.6", transform:"scale(0.85)" } },
        "spin-slow": { from: { transform:"rotate(0deg)" }, to: { transform:"rotate(360deg)" } },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;

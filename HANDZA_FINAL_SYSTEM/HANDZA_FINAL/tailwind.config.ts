import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}","./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {
    colors: {navy:"#1B3A6B","navy-dark":"#0F2347","navy-light":"#E8EDF5",handza:"#E8541A","handza-dark":"#C94210","handza-light":"#FFF0E8",lgray:"#F4F6FB",success:"#10b981"},
    fontFamily: {heading:["Syne","sans-serif"],body:["DM Sans","sans-serif"],sans:["DM Sans","sans-serif"]},
    borderRadius:{"2xl":"16px","3xl":"24px","4xl":"32px"},
    boxShadow:{sm:"0 1px 3px rgba(27,58,107,0.08)",md:"0 4px 16px rgba(27,58,107,0.10)",lg:"0 12px 40px rgba(27,58,107,0.12)",orange:"0 8px 24px rgba(232,84,26,0.28)"},
  }},
  plugins: [],
};
export default config;

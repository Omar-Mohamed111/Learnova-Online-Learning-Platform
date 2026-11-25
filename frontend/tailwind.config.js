/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: { extend: {
    fontFamily: { sans: ["DM Sans", "sans-serif"], display: ["Manrope", "sans-serif"] },
    colors: { brand: { 50:"#f1efff",100:"#e5e1ff",500:"#7564f5",600:"#6552e8",700:"#5140cc",900:"#241d55" } },
    boxShadow: { soft: "0 18px 60px rgba(34, 30, 80, .09)" }
  }},
  plugins: []
};
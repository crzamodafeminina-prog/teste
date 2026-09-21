/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        areia: "#F7F8FA",
        areiaesc: "#E8E3DB",
        offwhite: "#FFFFFF",
        terra: "#12345A",
        terraesc: "#071A33",
        cacau: "#071A33",
        oliva: "#12345A",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Karla", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

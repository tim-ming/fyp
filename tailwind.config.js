/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontWeight: {
      thin: "100",
      hairline: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
    letterSpacing: {
      tightest: "-.075em",
      tighter: "-.05em",
      tight: "-.025em",
      normal: "0",
      wide: ".025em",
      wider: ".05em",
      widest: ".1em",
      widest: ".25em",
    },
    extend: {
      colors: {
        blue100: "#F0F8FF",
        blue200: "#3373B0",
        gray100: "#8B8B8B",
        gray200: "#676767",
        gray300: "#535353",
        black100: "#1F1F1F",
        black200: "#000000",
        beige200: "#D1CCC8",
        beige300: "#E7E2DE",
      },
      spacing: {
        12: "48px",
      },
    },
  },
  plugins: [],
};

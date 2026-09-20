/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F9F8F6",
        surface: "#FFFFFF",
        ink: "#1C1C1A",
        muted: "#686864",
        line: "#E5E3DB",
        border: "hsl(var(--border, 220 13% 91%))",
        moss: {
          DEFAULT: "#2C4C3B",
          hover: "#1E3629",
          soft: "#DDE7DE",
        },
        clay: {
          DEFAULT: "#C05A46",
          hover: "#A64A38",
          soft: "#F5E3DE",
        },
        err: "#B94A48",
        ok: "#3C6E47",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 8px 32px rgba(0,0,0,0.04)",
        primary: "0 12px 40px rgba(44,76,59,0.15)",
        clay: "0 12px 40px rgba(192,90,70,0.20)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "slide-right": "slide-right 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

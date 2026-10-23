import type { Config } from "tailwindcss";

// Palette Dar Lalla : prune profonde (#2A0B28), comme un velours de caftan, + or (#BB8656).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", xl: "3rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        prune: {
          50: "#FAF4F9",
          100: "#F3E4F0",
          200: "#E5C6E0",
          300: "#CF9DC6",
          400: "#AE6DA3",
          500: "#8C4A82",
          600: "#6F3467",
          700: "#55234F",
          800: "#3F163B",
          900: "#2A0B28",
          950: "#180517",
        },
        or: {
          50: "#FBF6EE",
          100: "#F5EBDA",
          200: "#EAD5B3",
          300: "#DDBB88",
          400: "#CDA06C",
          500: "#BB8656",
          600: "#9C6B3F",
          700: "#7D5431",
          800: "#5E3F25",
          900: "#3F2A19",
        },
        ivoire: "#FBF8F4",
        champagne: "#F4EDE4",
        sable: "#EADFD2",
        encre: "#1E1214",
        taupe: "#6E5F5F",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      letterSpacing: {
        luxe: "0.25em",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "ken-burns": {
          "0%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Petite vibration périodique pour attirer l'attention (bouton Commander)
        attention: {
          "0%, 78%, 100%": { transform: "translateX(0) rotate(0)" },
          "80%": { transform: "translateX(-4px) rotate(-1deg)" },
          "83%": { transform: "translateX(4px) rotate(1deg)" },
          "86%": { transform: "translateX(-3px) rotate(-0.5deg)" },
          "89%": { transform: "translateX(3px) rotate(0.5deg)" },
          "92%": { transform: "translateX(-1px)" },
        },
      },
      animation: {
        "ken-burns": "ken-burns 7s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s linear infinite",
        marquee: "marquee 40s linear infinite",
        attention: "attention 3.5s ease-in-out 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;

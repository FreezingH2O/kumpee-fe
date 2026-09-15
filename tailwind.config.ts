import type { Config } from "tailwindcss";

/**
 * Token layer — the คัมภีร์ palette: a vivid royal blue primary on a soft,
 * light-blue canvas, navy ink, and teal / amber / rose accents (UI concept
 * reference). Components use tokens only, never raw hexes.
 *
 * VIOLET IS LOAD-BEARING: `violet` is reserved for AI-generated content only
 * (§0.2). Do not use it for decoration. เฉพาะทาง (specialist) tags use `blue`,
 * not violet, to keep that reservation intact.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#0B2E7A",
          700: "#0F4FC4",
          600: "#1263E6",
          500: "#1A73F5",
          200: "#BBD5FB",
          100: "#DCEAFE",
          50: "#EEF5FF",
        },
        teal: { 500: "#14B3A8", 700: "#0B7C74", 50: "#E4F7F4" },
        amber: { 400: "#F7B538", 500: "#F29D1B", 700: "#B4630A", 100: "#FFEBC2", 50: "#FFF6DF" },
        rose: { 600: "#E0435C", 50: "#FDECEF" },
        violet: { 600: "#7C3AED", 50: "#F5F3FF" }, // AI ONLY
        green: { 500: "#1FAE62", 700: "#127A43", 50: "#E6F7EE" },
        ink: { 900: "#0B1B3F", 600: "#4A5877", 400: "#8D9AB5" },
        line: "#DFE8F5",
        surface: "#FFFFFF",
        canvas: "#F3F8FF",
        slate100: "#EEF3FA",
      },
      fontFamily: {
        sans: ["var(--font-noto-thai)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        control: "12px",
        card: "20px",
        chip: "999px",
      },
      boxShadow: {
        // Soft blue-tinted elevation used by cards and the header.
        card: "0 1px 2px rgba(16, 60, 140, 0.04), 0 8px 24px -12px rgba(16, 60, 140, 0.14)",
        float: "0 2px 4px rgba(16, 60, 140, 0.05), 0 20px 48px -20px rgba(16, 60, 140, 0.28)",
        button: "0 6px 16px -6px rgba(26, 115, 245, 0.55)",
      },
      lineHeight: {
        // Thai needs generous leading — diacritics stack (§3)
        body: "1.6",
        heading: "1.45",
      },
    },
  },
  plugins: [],
};

export default config;

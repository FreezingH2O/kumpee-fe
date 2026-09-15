import type { Config } from "tailwindcss";

/**
 * Token layer — values are the คำภีร์ palette from front-end.md §3, each one
 * verified against the real Figma D2 frames (44:26 uses exactly these hexes).
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
          700: "#1E40AF",
          600: "#1D4ED8",
          500: "#2563EB",
          100: "#DBEAFE",
          50: "#EFF6FF",
        },
        teal: { 500: "#14B8A6", 700: "#0F766E", 50: "#E6FAF6" },
        amber: { 500: "#F59E0B", 700: "#B45309", 50: "#FEF6E0" },
        violet: { 600: "#7C3AED", 50: "#F5F3FF" }, // AI ONLY
        green: { 500: "#10B981", 700: "#047857", 50: "#E7F8F1" },
        ink: { 900: "#0F172A", 600: "#475569", 400: "#94A3B8" },
        line: "#E2E8F0",
        surface: "#FFFFFF",
        canvas: "#F4F9FF",
        slate100: "#F1F5F9",
      },
      fontFamily: {
        sans: ["var(--font-noto-thai)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        control: "12px",
        card: "16px",
        chip: "999px",
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

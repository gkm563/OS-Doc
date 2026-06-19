/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["selector", "[data-theme=\"dark\"]"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        surface: "var(--bg-surface)",
        "surface-elevated": "var(--bg-surface-elevated)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
        },
        status: {
          merged: "var(--status-merged)",
          open: "var(--status-open)",
          pending: "var(--status-pending)",
          rejected: "var(--status-rejected)",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
    },
  },
  plugins: [],
}

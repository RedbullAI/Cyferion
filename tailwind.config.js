/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f4f8",
        foreground: "#0f172a",
        sidebar: {
          DEFAULT: "#ffffff",
          active: "#eff6ff",
          border: "#e2e8f0",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        border: "#e2e8f0",
        primary: {
          DEFAULT: "#1e3a8a",
          light: "#3b82f6",
          lighter: "#eff6ff",
          dark: "#1e3050",
        },
        accent: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
          dark: "#b45309",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fef2f2",
          dark: "#b91c1c",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#ecfdf5",
          dark: "#059669",
        },
        muted: "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
        'sidebar': '1px 0 0 0 #e2e8f0',
        'app-glow': '0 0 80px 20px rgba(59, 130, 246, 0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      },
    },
  },
  plugins: [],
}

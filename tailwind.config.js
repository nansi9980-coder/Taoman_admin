/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003d9b",
          container: "#0052cc",
          fixed: "#dae2ff",
          "fixed-dim": "#b2c5ff",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#c4d2ff",
        "on-primary-fixed": "#001848",
        "on-primary-fixed-variant": "#0040a2",
        "inverse-primary": "#b2c5ff",

        secondary: {
          DEFAULT: "#43617b",
          container: "#c1e0ff",
          fixed: "#cce5ff",
          "fixed-dim": "#abcae8",
        },
        "on-secondary": "#ffffff",
        "on-secondary-container": "#46647e",
        "on-secondary-fixed": "#001e31",
        "on-secondary-fixed-variant": "#2b4a62",

        tertiary: {
          DEFAULT: "#7b2600",
          container: "#a33500",
          fixed: "#ffdbcf",
          "fixed-dim": "#ffb59b",
        },
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffc6b2",
        "on-tertiary-fixed": "#380d00",
        "on-tertiary-fixed-variant": "#812800",

        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        surface: {
          DEFAULT: "#faf8ff",
          dim: "#d9d9e4",
          bright: "#faf8ff",
          tint: "#0c56d0",
          variant: "#e1e2ec",
          container: {
            DEFAULT: "#ededf8",
            lowest: "#ffffff",
            low: "#f3f3fd",
            high: "#e7e7f2",
            highest: "#e1e2ec",
          },
        },
        "on-surface": "#191b23",
        "on-surface-variant": "#434654",
        "inverse-surface": "#2e3038",
        "inverse-on-surface": "#f0f0fb",

        outline: {
          DEFAULT: "#737685",
          variant: "#c3c6d6",
        },

        background: "#faf8ff",
        "on-background": "#191b23",

        // Dark mode tokens
        dark: {
          surface: "#12131a",
          "surface-container": "#1e1f2a",
          "surface-container-low": "#191a24",
          "surface-container-high": "#282a36",
          "on-surface": "#e4e4ef",
          "on-surface-variant": "#c4c6d6",
          primary: "#b2c5ff",
          outline: "#8e90a2",
          "outline-variant": "#434654",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "64px",
      },
      boxShadow: {
        card: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        "card-hover": "0px 8px 24px rgba(0, 0, 0, 0.10)",
        topbar: "0px 1px 4px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideIn: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        pulse2: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideIn: "slideIn 0.25s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};
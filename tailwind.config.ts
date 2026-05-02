import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Stitch Material Design 3 colors
        "stitch-surface": "#131319",
        "stitch-surface-dim": "#131319",
        "stitch-surface-bright": "#393840",
        "stitch-surface-container": "#1f1f26",
        "stitch-surface-container-low": "#1b1b22",
        "stitch-surface-container-high": "#2a2930",
        "stitch-surface-container-highest": "#35343b",
        "stitch-surface-container-lowest": "#0e0e14",
        "stitch-on-surface": "#e4e1ea",
        "stitch-on-surface-variant": "#cbc3d7",
        "stitch-on-background": "#e4e1ea",
        "stitch-primary": "#d0bcff",
        "stitch-on-primary": "#3c0091",
        "stitch-primary-container": "#a078ff",
        "stitch-on-primary-container": "#340080",
        "stitch-primary-fixed": "#e9ddff",
        "stitch-primary-fixed-dim": "#d0bcff",
        "stitch-secondary": "#fbabff",
        "stitch-on-secondary": "#580065",
        "stitch-secondary-container": "#ae05c6",
        "stitch-tertiary": "#4cd7f6",
        "stitch-outline": "#958ea0",
        "stitch-outline-variant": "#494454",
        "stitch-surface-variant": "#35343b",
        "stitch-surface-tint": "#d0bcff",
        "stitch-inverse-primary": "#6d3bd7",
        "stitch-inverse-surface": "#e4e1ea",
      },
      fontFamily: {
        "heading": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      },
      fontSize: {
        "h1": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }],
        "h2": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "h3": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.1em", fontWeight: "700" }],
      },
      spacing: {
        "section-gap": "48px",
        "gutter": "16px",
        "container-padding": "24px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

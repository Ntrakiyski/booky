/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
const daisyuiColorObj = require("daisyui/src/theming/index");

module.exports = {
  daisyui: {
    themes: [
      {
        light: {
          primary: "#737373",
          "primary-content": "#fafafa",
          secondary: "#f5f5f5",
          "secondary-content": "#171717",
          accent: "#f5f5f5",
          "accent-content": "#171717",
          neutral: "#717171",
          "neutral-content": "#e5e5e5",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#e5e5e5",
          "base-content": "#0a0a0a",
          info: "#a5f3fc",
          success: "#22c55e",
          warning: "#facc15",
          error: "#e7000b",
          "--rounded-box": "0rem",
          "--rounded-btn": "0rem",
          "--rounded-badge": "0rem",
        },
      },
      {
        dark: {
          primary: "#737373",
          "primary-content": "#fafafa",
          secondary: "#262626",
          "secondary-content": "#fafafa",
          accent: "#404040",
          "accent-content": "#fafafa",
          neutral: "#a1a1a1",
          "neutral-content": "#383838",
          "base-100": "#0a0a0a",
          "base-200": "#191919",
          "base-300": "#262626",
          "base-content": "#fafafa",
          info: "#009ee4",
          success: "#00b17d",
          warning: "#eac700",
          error: "#ff6467",
          "--rounded-box": "0rem",
          "--rounded-btn": "0rem",
          "--rounded-badge": "0rem",
        },
      },
    ],
  },
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // For the "layouts" directory
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    require("daisyui"),
    plugin(({ addVariant }) => {
      addVariant("dark", '&[data-theme="dark"]');
    }),
    require("tailwindcss-animate"),
  ],
  theme: {
    extend: {
      colors: {
        border: daisyuiColorObj["neutral-content"],
        input: daisyuiColorObj["base-content"],
        ring: daisyuiColorObj["base-content"],
        background: daisyuiColorObj["base-100"],
        foreground: daisyuiColorObj["base-content"],
        primary: {
          DEFAULT: daisyuiColorObj["primary"],
          foreground: daisyuiColorObj["primary-content"],
        },
        secondary: {
          DEFAULT: daisyuiColorObj["secondary"],
          foreground: daisyuiColorObj["secondary-content"],
        },
        destructive: {
          DEFAULT: daisyuiColorObj["error"],
          foreground: daisyuiColorObj["error-content"],
        },
        muted: {
          DEFAULT: daisyuiColorObj["base-300"],
          foreground: daisyuiColorObj["base-content"],
        },
        accent: {
          DEFAULT: daisyuiColorObj["accent"],
          foreground: daisyuiColorObj["accent-content"],
        },
        popover: {
          DEFAULT: daisyuiColorObj["base-200"],
          foreground: daisyuiColorObj["base-content"],
        },
        card: {
          DEFAULT: daisyuiColorObj["base-100"],
          foreground: daisyuiColorObj["base-content"],
        },
      },
      borderRadius: {
        lg: "0rem",
        md: "0rem",
        sm: "0rem",
        xl: "0rem",
        "2xl": "0rem",
        "3xl": "0rem",
        full: "0rem",
      },
      fontFamily: {
        sans: ["Geist Mono", "monospace"],
        serif: ["Geist Mono", "monospace"],
        mono: ["Geist Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
};

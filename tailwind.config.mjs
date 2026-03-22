import daisyui from "daisyui";

export default {
  content: [
    "./content/**/*.{html,json}",
    "./scripts/**/*.{js,mjs}",
    "./src/**/*.{html,js,mjs}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Noto Sans JP"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        obsidian: "#0d0f14",
        surface: "#13161f",
        line: "#1f2433",
        signal: "#4af0d4",
        fog: "#c0cce0",
        paper: "#eef2ff",
        dim: "#4a5570"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(5, 8, 12, 0.35)"
      }
    }
  },
  daisyui: {
    logs: false,
    themes: [
      {
        ardeditorial: {
          primary: "#eef2ff",
          secondary: "#4af0d4",
          accent: "#4af0d4",
          neutral: "#13161f",
          "base-100": "#0d0f14",
          "base-200": "#13161f",
          "base-300": "#1f2433",
          "base-content": "#c0cce0",
          info: "#7dd3fc",
          success: "#4ade80",
          warning: "#facc15",
          error: "#fb7185"
        }
      }
    ]
  },
  plugins: [daisyui]
};

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
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      colors: {
        obsidian: "#edf3f7",
        surface: "#ffffff",
        line: "#d6e3eb",
        signal: "#237f82",
        fog: "#344657",
        paper: "#172b3d",
        dim: "#526879"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(69, 106, 137, 0.12)"
      }
    }
  },
  daisyui: {
    logs: false,
    themes: [
      {
        ardeditorial: {
          primary: "#172b3d",
          secondary: "#237f82",
          accent: "#237f82",
          neutral: "#ffffff",
          "base-100": "#edf3f7",
          "base-200": "#ffffff",
          "base-300": "#d6e3eb",
          "base-content": "#344657",
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

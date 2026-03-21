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
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#132238",
        sand: "#f7f1e6",
        ember: "#d14c2f",
        brass: "#a66a1c",
        mist: "#dce8f2"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(19, 34, 56, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(19,34,56,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(19,34,56,0.08) 1px, transparent 1px)"
      }
    }
  },
  daisyui: {
    logs: false,
    themes: [
      {
        ardlight: {
          primary: "#132238",
          secondary: "#d14c2f",
          accent: "#a66a1c",
          neutral: "#1f2937",
          "base-100": "#f7f1e6",
          "base-200": "#efe5d5",
          "base-300": "#e1d4bf",
          "base-content": "#132238",
          info: "#2f6fae",
          success: "#1f7a45",
          warning: "#b7791f",
          error: "#c53030"
        }
      }
    ]
  },
  plugins: [daisyui]
};

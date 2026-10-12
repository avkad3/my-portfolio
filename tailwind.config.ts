import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#080808",
        surface: "#0E0E0E",
        raised: "#141414",
        line: "#222222",
        "line-strong": "#333333",
        fg: "#F5F5F5",
        muted: "#8A8A8A",
        dim: "#5A5A5A",
        accent: { DEFAULT: "#3DF2A6", soft: "#3DF2A61A", blue: "#5AB8FF" },
        warn: "#F2C94C",
        danger: "#FF5C5C",
      },
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        mega: ["clamp(3.25rem, 11vw, 10.5rem)", { lineHeight: "0.86", letterSpacing: "-0.045em" }],
        giant: ["clamp(2.5rem, 7vw, 6.5rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        huge: ["clamp(2rem, 4.6vw, 4.25rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
      },
      keyframes: {
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
        pulseDot: "pulseDot 2.2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

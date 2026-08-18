/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090e",
        card: "rgba(18, 24, 36, 0.75)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        cyber: {
          cyan: "#00f2fe",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#ff2a5f",
          violet: "#8b5cf6",
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2.5s ease-in-out infinite alternate',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(255, 42, 95, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 42, 95, 0.6)' },
        },
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};

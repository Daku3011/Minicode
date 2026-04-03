/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(250 40% 3%)',
        foreground: 'hsl(210 40% 98%)',
        primary: 'hsl(263 90% 66%)',
        'primary-foreground': 'hsl(210 40% 98%)',
        secondary: 'hsl(190 100% 45%)',
        'secondary-foreground': 'hsl(222 47% 11%)',
        muted: 'hsl(250 20% 10%)',
        'muted-foreground': 'hsl(215 16% 65%)',
        accent: 'hsl(263 70% 30%)',
        'accent-foreground': 'hsl(210 40% 98%)',
        popover: 'hsl(250 30% 5%)',
        'popover-foreground': 'hsl(215 20% 80%)',
        border: 'hsl(250 20% 12%)',
        input: 'hsl(250 20% 12%)',
        card: 'hsl(250 35% 6%)',
        'card-foreground': 'hsl(210 40% 98%)',
      },
      borderRadius: {
        lg: '1.5rem',
        md: '1rem',
        sm: '0.75rem',
      },
      boxShadow: {
        weightless: '0 20px 40px -20px rgba(0, 0, 0, 0.5)',
        antigravity: '0 40px 80px -40px rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-aura': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-aura': 'pulse-aura 4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
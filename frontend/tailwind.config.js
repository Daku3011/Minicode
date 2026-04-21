/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(210 40% 98%)',
        foreground: 'hsl(215 25% 15%)',
        primary: 'hsl(213 94% 48%)',
        'primary-foreground': 'hsl(0 0% 100%)',
        secondary: 'hsl(196 100% 42%)',
        'secondary-foreground': 'hsl(215 25% 10%)',
        muted: 'hsl(210 30% 95%)',
        'muted-foreground': 'hsl(215 16% 47%)',
        accent: 'hsl(213 80% 94%)',
        'accent-foreground': 'hsl(213 94% 35%)',
        popover: 'hsl(0 0% 100%)',
        'popover-foreground': 'hsl(215 25% 18%)',
        border: 'hsl(213 30% 88%)',
        input: 'hsl(213 30% 88%)',
        card: 'hsl(0 0% 100%)',
        'card-foreground': 'hsl(215 25% 15%)',
      },
      borderRadius: {
        lg: '1.5rem',
        md: '1rem',
        sm: '0.75rem',
      },
      boxShadow: {
        'blue-sm': '0 1px 3px rgba(14, 113, 219, 0.08), 0 1px 2px rgba(14, 113, 219, 0.04)',
        'blue-md': '0 4px 12px rgba(14, 113, 219, 0.10), 0 2px 6px rgba(14, 113, 219, 0.06)',
        'blue-lg': '0 10px 30px rgba(14, 113, 219, 0.12), 0 4px 12px rgba(14, 113, 219, 0.08)',
        weightless: '0 20px 40px -20px rgba(14, 113, 219, 0.18)',
        antigravity: '0 40px 80px -40px rgba(14, 113, 219, 0.25)',
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
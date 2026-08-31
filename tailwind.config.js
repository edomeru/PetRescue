/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pet: {
          pink: '#FF6584',
          purple: '#6C5CE7',
          blue: '#45AAF2',
          teal: '#2ED573',
          yellow: '#FFA502',
          orange: '#FF7F50',
          dark: '#1E1E2E',
          card: 'rgba(255, 255, 255, 0.85)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(108, 92, 231, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(108, 92, 231, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      backgroundImage: {
        'pet-gradient': 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
        'hero-gradient': 'linear-gradient(135deg, #6C5CE7 0%, #FF6584 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFE000 0%, #799F0C 100%)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0f',
        panel: '#14141f',
        cyan: {
          DEFAULT: '#00e5d0',
          400: '#22f0dd',
          500: '#00e5d0',
          600: '#00b8a8',
        },
        magenta: {
          DEFAULT: '#ff2e9a',
          400: '#ff5cb0',
          500: '#ff2e9a',
          600: '#d61a7c',
        },
        sunny: {
          DEFAULT: '#ffd93d',
          400: '#ffe066',
          500: '#ffd93d',
          600: '#f5c518',
        },
        grape: {
          DEFAULT: '#7c3aed',
          500: '#7c3aed',
          600: '#6d28d9',
        },
        // card category colors
        titles: '#ff4fa3',
        characters: '#2fe082',
        anything: '#3aa0ff',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 30px -8px rgba(0,0,0,0.55)',
        glow: '0 0 40px -6px rgba(0,229,208,0.6)',
        'glow-magenta': '0 0 40px -6px rgba(255,46,154,0.6)',
        pop: '0 6px 0 0 rgba(0,0,0,0.35)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        floaty: 'floaty 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}

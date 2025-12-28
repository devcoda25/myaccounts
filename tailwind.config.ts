import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        evzone: {
          green: '#03cd8c',
          orange: '#f77f00',
          // optional supportive shades
          'green-900': '#07110F',
          'green-800': '#0B1A17',
          'mint-50': '#F4FFFB',
        },
      },
      boxShadow: {
        'evzone-glow': '0 20px 60px rgba(3,205,140,0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config

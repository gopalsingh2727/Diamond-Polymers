/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Orange Palette (Light Mode)
        primary: {
          DEFAULT: '#FF6B35',
          50: '#FFF5F0',
          100: '#FFE8DD',
          200: '#FFD1BB',
          300: '#FFB088',
          400: '#FF8F55',
          500: '#FF6B35',
          600: '#E55A2B',
          700: '#CC4A22',
          800: '#993818',
          900: '#66250F',
        },
        // Secondary Golden Orange
        secondary: {
          DEFAULT: '#FFA500',
          50: '#FFF8E6',
          100: '#FFEFC2',
          200: '#FFE08A',
          300: '#FFD152',
          400: '#FFC21A',
          500: '#FFA500',
          600: '#E69500',
          700: '#CC8400',
          800: '#996300',
          900: '#664200',
        },
        // Background colors
        background: {
          DEFAULT: '#FFFFFF',
        },
        // Surface colors for cards, etc.
        surface: {
          DEFAULT: '#F9FAFB',
        },
        // Text colors
        text: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
        },
        // Border colors
        border: {
          DEFAULT: '#E5E7EB',
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 107, 53, 0.4)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}

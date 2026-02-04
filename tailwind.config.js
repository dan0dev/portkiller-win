/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clean, minimal grey palette
        bg: {
          primary: '#1e1e1e',
          secondary: '#252525',
          elevated: '#2a2a2a',
        },
        // Glassmorphic sidebar
        glass: {
          bg: 'rgba(30, 30, 30, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#6b6b6b',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.04)',
        },
        // Minimal accent - only for active states
        accent: {
          blue: '#5c9fff',
          green: '#4ade80',
          red: '#f87171',
          yellow: '#facc15',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

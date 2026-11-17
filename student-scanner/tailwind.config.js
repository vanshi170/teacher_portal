/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#fdf2f6',
        'hot-pink': '#EC77AB',
        thistle: '#D4C0F2',
        ink: '#12122B',
        muted: '#6B6B85',
        'present-green': '#16A34A',
        'absent-red': '#DC2626',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        'plex-mono': ['"IBM Plex Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(236, 119, 171, 0.15)',
        'glass-hover': '0 12px 40px 0 rgba(236, 119, 171, 0.25)',
      }
    },
  },
  plugins: [],
}

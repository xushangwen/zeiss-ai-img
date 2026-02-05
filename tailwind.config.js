/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-card': '#1a1a1a',
        'bg-hover': '#252525',
        'accent': '#3b82f6',
        'accent-hover': '#2563eb',
        'success': '#22c55e',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
        'border': '#2a2a2a',
      },
      fontFamily: {
        'sans': ['IBM Plex Sans SC', 'sans-serif'],
        'mono': ['Space Grotesk', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
      },
      spacing: {
        'sidebar': '240px',
      },
    },
  },
  plugins: [],
}

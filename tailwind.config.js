/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f1117',
        'bg-card': '#181b25',
        'bg-hover': '#222633',
        'bg-elevated': '#282d3e',
        'zeiss-blue': '#0065BD',
        'accent': '#2b7de9',
        'accent-hover': '#1a6ad4',
        'accent-light': '#5a9ef0',
        'accent-glow': 'rgba(43, 125, 233, 0.18)',
        'success': '#22c993',
        'warning': '#f5a623',
        'error': '#f25c5c',
        'text-primary': '#f0f2f8',
        'text-secondary': '#8b92b0',
        'text-tertiary': '#505775',
        'border': '#262b3e',
        'border-light': '#353b54',
      },
      fontFamily: {
        'sans': ['IBM Plex Sans SC', 'system-ui', 'sans-serif'],
        'mono': ['Space Grotesk', 'monospace'],
        'display': ['Google Sans', 'IBM Plex Sans SC', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'btn': '10px',
      },
      spacing: {
        'sidebar': '260px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.25), 0 0 0 1px rgba(38,43,62,0.6)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(43,125,233,0.25)',
        'glow': '0 0 24px rgba(43,125,233,0.18)',
        'glow-strong': '0 0 48px rgba(43,125,233,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.03) 50%, transparent 75%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

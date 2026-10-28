/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F9FC',
        surface: '#FFFFFF',
        'primary-blue': '#315EFB',
        'secondary-violet': '#7657F6',
        'text-main': '#172033',
        'text-muted': '#64748B',
        'app-border': '#E5EAF2',
        'app-success': '#15966A',
        'app-warning': '#D99116',
        'app-error': '#D94B5B',
        'panel-tint': '#EEF3FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        handwriting: ['Kalam', 'Caveat', 'cursive'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 4px 12px 0 rgba(23, 32, 51, 0.04), 0 1px 3px 0 rgba(23, 32, 51, 0.03)',
        'card-hover': '0 8px 24px 0 rgba(49, 94, 251, 0.08), 0 2px 6px 0 rgba(23, 32, 51, 0.04)',
        elevated: '0 12px 32px -4px rgba(23, 32, 51, 0.08), 0 4px 12px -2px rgba(23, 32, 51, 0.04)',
      },
    },
  },
  plugins: [],
}

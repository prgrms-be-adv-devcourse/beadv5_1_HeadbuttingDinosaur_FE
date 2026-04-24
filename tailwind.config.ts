import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-hover': 'var(--brand-hover)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['var(--font)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
} satisfies Config

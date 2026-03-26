// RUTA: tailwind.config.ts (raiz del proyecto)
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#fff1f1',
          100: '#ffd7d7',
          200: '#ffb3b3',
          300: '#ff8080',
          400: '#ff4d4d',
          500: '#CC0000',
          600: '#aa0000',
          700: '#880000',
          800: '#660000',
          900: '#440000',
        },
        sidebar: {
          bg:     '#2D2D2D',
          active: '#242424',
          hover:  '#3D3D3D',
          border: '#1A1A1A',
        },
        surface: {
          page: '#F5F5F5',
          card: '#FFFFFF',
          dark: '#1A1A1A',
          'card-dark': '#242424',
        },
        canvas: {
          border:   '#C7CDD1',
          text:     '#2D3B45',
          muted:    '#556572',
          hint:     '#8B969D',
        },
        // Colores por nivel de asignatura
        nivel: {
          1: '#CC0000',
          2: '#0374B5',
          3: '#0B874B',
          4: '#FC5E13',
          5: '#7B2D8B',
        },
      },
      borderRadius: {
        card: '4px',
      },
    },
  },
  plugins: [],
}

export default config
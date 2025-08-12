/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // LaunchZone Brand Color System
        night: '#0B1220',      // Night Navy (primary bg)
        space: '#0F1B2E',      // Deep Space (surfaces)
        electric: '#1FB5FF',   // Electric Blue
        orange: '#FF7A00',     // Neon Orange
        teal: '#00E5A8',       // Neon Teal/Green
        lime: '#69FFB1',       // Lime Glow
        
        // Text Colors
        heading: '#EAF2FF',    // Headings
        body: '#B9C7D9',       // Body text
        muted: '#7F8CA0',      // Muted text
        
        // Legacy support (gradual migration)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#1FB5FF', // Maps to electric blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#FF7A00', // Maps to neon orange
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      backgroundImage: {
        // Gradient system
        'grad-heat': 'linear-gradient(135deg, #FF7A00 0%, #1FB5FF 100%)',
        'grad-quantum': 'linear-gradient(135deg, #FF7A00 0%, #00E5A8 50%, #1FB5FF 100%)',
        'grad-surge': 'linear-gradient(135deg, #00E5A8 0%, #1FB5FF 100%)',
      },
      boxShadow: {
        // Glow effects
        'glow-blue': '0 0 20px rgba(31, 181, 255, 0.45)',
        'glow-teal': '0 0 20px rgba(0, 229, 168, 0.40)',
        'glow-orange': '0 0 20px rgba(255, 122, 0, 0.35)',
        'glow-blue-lg': '0 0 40px rgba(31, 181, 255, 0.45)',
        'glow-teal-lg': '0 0 40px rgba(0, 229, 168, 0.40)',
        'glow-orange-lg': '0 0 40px rgba(255, 122, 0, 0.35)',
        
        // Enhanced card shadows
        'card': '0 4px 6px -1px rgba(11, 18, 32, 0.1), 0 2px 4px -1px rgba(11, 18, 32, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(11, 18, 32, 0.2), 0 4px 6px -2px rgba(11, 18, 32, 0.1)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(11, 18, 32, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-light': 'bounceLight 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' }
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      }
    },
  },
  plugins: [],
}
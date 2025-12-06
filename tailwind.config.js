/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          muted: "hsl(var(--primary-muted))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#f0f9ff',
          100: '#e0f2fe', 
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif'
        ],
      },
      animation: {
        // Existing animations
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'text-shimmer': 'textShimmer 2.5s ease-in-out infinite',
        
        // Enhanced animations
        'morph-in': 'morphIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-up-fade': 'slideUpFade 0.6s ease-out',
        'scale-bounce': 'scaleBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float-rotate': 'floatRotate 8s ease-in-out infinite',
        'shimmer-wave': 'shimmerWave 3s ease-in-out infinite',
        'elastic-scale': 'elasticScale 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'breath': 'breath 4s ease-in-out infinite',
        
        // Toast animations
        'toast-in': 'toastIn 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
        'toast-out': 'toastOut 0.3s cubic-bezier(0.06, 0.71, 0.55, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        bounceGentle: {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        glow: {
          '0%': {
            textShadow: '0 0 5px rgba(156, 212, 227, 0.5), 0 0 10px rgba(156, 212, 227, 0.5), 0 0 15px rgba(156, 212, 227, 0.5)',
          },
          '100%': {
            textShadow: '0 0 10px rgba(156, 212, 227, 0.8), 0 0 20px rgba(156, 212, 227, 0.8), 0 0 30px rgba(156, 212, 227, 0.8)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(156, 212, 227, 0.4), 0 0 40px rgba(156, 212, 227, 0.2)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(156, 212, 227, 0.6), 0 0 60px rgba(156, 212, 227, 0.4)',
            transform: 'scale(1.05)'
          },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(50px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        textShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        
        // Enhanced keyframes
        morphIn: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.8) rotate(-10deg)',
            filter: 'blur(10px)'
          },
          '50%': { 
            opacity: '0.8', 
            transform: 'scale(1.05) rotate(2deg)',
            filter: 'blur(2px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1) rotate(0deg)',
            filter: 'blur(0px)'
          },
        },
        
        slideUpFade: {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        
        scaleBounce: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)',
            transform: 'scale(1.02)'
          },
        },
        
        floatRotate: {
          '0%, 100%': { 
            transform: 'translateY(0) rotate(0deg) scale(1)' 
          },
          '25%': { 
            transform: 'translateY(-10px) rotate(1deg) scale(1.02)' 
          },
          '50%': { 
            transform: 'translateY(-15px) rotate(0deg) scale(1)' 
          },
          '75%': { 
            transform: 'translateY(-10px) rotate(-1deg) scale(1.02)' 
          },
        },
        
        shimmerWave: {
          '0%': { 
            backgroundPosition: '-200% center',
            opacity: '0.3' 
          },
          '50%': { 
            backgroundPosition: '0% center',
            opacity: '0.8' 
          },
          '100%': { 
            backgroundPosition: '200% center',
            opacity: '0.3' 
          },
        },
        
        elasticScale: {
          '0%': { transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        
        breath: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.8'
          },
          '50%': { 
            transform: 'scale(1.03)',
            opacity: '1'
          },
        },
        
        // Toast keyframes
        toastIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-100%) scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        toastOut: {
          '0%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-100%) scale(0.9)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px hsl(var(--primary) / 0.3)',
        'glow-lg': '0 0 40px hsl(var(--primary) / 0.4)', 
        'glow-xl': '0 0 60px hsl(var(--primary) / 0.5)',
        'inner-glow': 'inset 0 0 20px hsl(var(--primary) / 0.1)',
        'neon': '0 0 5px hsl(var(--primary) / 0.5), 0 0 10px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.5)',
        'neon-lg': '0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.6), 0 0 40px hsl(var(--primary) / 0.6), 0 0 80px hsl(var(--primary) / 0.6)',
        'elegant': '0 10px 30px -5px hsl(var(--primary) / 0.2), 0 0 0 1px hsl(var(--primary) / 0.05)',
        'glass': '0 8px 32px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--primary) / 0.2)',
        'depth': '0 25px 50px -12px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--primary) / 0.05)',
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
};
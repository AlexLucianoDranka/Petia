import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'st-navy':      '#0F1F38',
        'st-deep':      '#1A3A6B',
        'st-steel':     '#2B5BAA',
        'st-electric':  '#3B82F6',
        'st-ice':       '#C8DEFF',
        'st-arctic':    '#F4F7FF',
        'st-muted':     '#8BA8C8',
        'st-surface':   '#162D52',
        'st-surface-2': '#1E3A5F',
        'st-border':    'rgba(59, 130, 246, 0.15)',
        'st-success':   '#10B981',
        'st-warning':   '#F59E0B',
        'st-danger':    '#EF4444',
        'st-info':      '#06B6D4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
      },
      boxShadow: {
        'sm':   '0 1px 3px rgba(0,0,0,.4), 0 0 0 1px rgba(59,130,246,.08)',
        'md':   '0 4px 16px rgba(0,0,0,.5), 0 0 0 1px rgba(59,130,246,.1)',
        'glow': '0 0 20px rgba(59,130,246,.25)',
        'glow-success': '0 0 20px rgba(16,185,129,.25)',
        'glow-danger':  '0 0 20px rgba(239,68,68,.25)',
      },
      animation: {
        'fade-up':    'fadeUp 0.3s ease both',
        'fade-in':    'fadeIn 0.25s ease both',
        'pulse-glow': 'pulseGlow 2s infinite',
        'slide-in':   'slideIn 0.3s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(59,130,246,0.15)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};

export default config;

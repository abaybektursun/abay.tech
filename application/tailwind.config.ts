import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/ai-chatbot/components/**/*.{js,ts,jsx,tsx}",
    "./packages/ai-chatbot/app/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: ['class'],
  theme: {
    // Override spacing with perfect 8-point grid
    spacing: {
      // Fractional for precise adjustments (use sparingly)
      px: '1px',
      0: '0',
      0.5: '0.125rem', // 2px - only for borders
      1: '0.25rem',    // 4px - only for small gaps

      // Primary 8-point scale (use these)
      2: '0.5rem',     // 8px ✓
      3: '0.75rem',    // 12px - avoid
      4: '1rem',       // 16px ✓
      5: '1.25rem',    // 20px - avoid
      6: '1.5rem',     // 24px ✓
      7: '1.75rem',    // 28px - avoid
      8: '2rem',       // 32px ✓
      9: '2.25rem',    // 36px - avoid
      10: '2.5rem',    // 40px ✓
      11: '2.75rem',   // 44px ✓ (accessibility)
      12: '3rem',      // 48px ✓
      14: '3.5rem',    // 56px ✓
      16: '4rem',      // 64px ✓
      18: '4.5rem',    // 72px ✓
      20: '5rem',      // 80px ✓
      22: '5.5rem',    // 88px ✓
      24: '6rem',      // 96px ✓
      28: '7rem',      // 112px ✓
      32: '8rem',      // 128px ✓
      36: '9rem',      // 144px
      40: '10rem',     // 160px
      44: '11rem',     // 176px
      48: '12rem',     // 192px
      52: '13rem',     // 208px
      56: '14rem',     // 224px (sidebar width)
      60: '15rem',     // 240px
      64: '16rem',     // 256px
      72: '18rem',     // 288px
      80: '20rem',     // 320px
      96: '24rem',     // 384px
    },
    fontFamily: {
      sans: ['geist'],
      mono: ['geist-mono'],
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1024px', // Cap at 1024px (similar to your max-w-4xl)
      },
    },
    extend: {
      // Touch target sizes
      minHeight: {
        'touch': '2.75rem',     // 44px - WCAG AA
        'touch-lg': '3rem',     // 48px - Recommended
        'touch-xl': '3.5rem',   // 56px - Comfortable
      },
      minWidth: {
        'touch': '2.75rem',     // 44px
        'touch-lg': '3rem',     // 48px
        'touch-xl': '3.5rem',   // 56px
      },

      // Container sizing for optimal readability
      maxWidth: {
        'readable': '65ch',     // Optimal reading width
        'content': '50rem',     // 800px - content max
        'wide': '75rem',        // 1200px - wide layouts
        'ultrawide': '90rem',   // 1440px - full layouts
      },

      // Line heights for vertical rhythm (24px baseline)
      lineHeight: {
        'baseline': '1.5rem',   // 24px - base rhythm
        'baseline-2': '3rem',   // 48px - 2x baseline
        'baseline-3': '4.5rem', // 72px - 3x baseline
      },

      // Font sizes with perfect line heights
      fontSize: {
        // size: [fontSize, { lineHeight, letterSpacing }]
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px/16px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px/20px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px/24px ✓ baseline
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px/28px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px/28px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px/32px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px/36px
        '4xl': ['2.25rem', { lineHeight: '3rem' }],       // 36px/48px ✓ 2x baseline
        '5xl': ['3rem', { lineHeight: '3rem' }],          // 48px/48px ✓ 2x baseline
        '6xl': ['3.75rem', { lineHeight: '4.5rem' }],     // 60px/72px ✓ 3x baseline
        '7xl': ['4.5rem', { lineHeight: '4.5rem' }],      // 72px/72px ✓ 3x baseline
      },

      // Animation durations matching your animation.ts
      transitionDuration: {
        '400': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },

      // Consistent border radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1100',
        'fixed': '1200',
        'modal-backdrop': '1300',
        'modal': '1400',
        'popover': '1500',
        'tooltip': '1600',
      },

      // Colors (preserving your existing colors)
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    // Plugin for fluid responsive utilities
    plugin(function({ addUtilities, matchUtilities, theme }) {
      // Fluid padding utilities (only for sections/heroes)
      addUtilities({
        '.fluid-section': {
          paddingTop: 'clamp(3rem, 8vw, 6rem)',
          paddingBottom: 'clamp(3rem, 8vw, 6rem)',
        },
        '.fluid-section-sm': {
          paddingTop: 'clamp(2rem, 5vw, 3rem)',
          paddingBottom: 'clamp(2rem, 5vw, 3rem)',
        },
        '.fluid-section-lg': {
          paddingTop: 'clamp(4rem, 10vw, 8rem)',
          paddingBottom: 'clamp(4rem, 10vw, 8rem)',
        },
        '.fluid-container': {
          paddingLeft: 'clamp(1rem, 4vw, 2rem)',
          paddingRight: 'clamp(1rem, 4vw, 2rem)',
        },
      })

      // Generate fluid text utilities for hero sections only
      matchUtilities(
        {
          'fluid': (value) => ({
            fontSize: value,
          }),
        },
        {
          values: {
            'hero': 'clamp(2.5rem, 5vw + 1rem, 4rem)',
            'title': 'clamp(2rem, 4vw + 0.5rem, 3rem)',
            'subtitle': 'clamp(1.25rem, 2vw + 0.5rem, 1.75rem)',
          },
        }
      )

      // Touch-friendly utilities
      addUtilities({
        '.touch-target': {
          minHeight: '2.75rem', // 44px
          minWidth: '2.75rem',
        },
        '.touch-target-lg': {
          minHeight: '3rem',    // 48px
          minWidth: '3rem',
        },
      })

      // Baseline grid helpers (for typography)
      addUtilities({
        '.baseline-grid': {
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(0,0,0,0.05) 23px, rgba(0,0,0,0.05) 24px)',
        },
        '.text-baseline': {
          lineHeight: '1.5rem', // 24px baseline
        },
      })
    }),
  ]
} satisfies Config;
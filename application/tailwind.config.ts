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
  darkMode: 'class',
  theme: {
  	spacing: {
  		'0': '0',
  		'1': '0.25rem',
  		'2': '0.5rem',
  		'3': '0.75rem',
  		'4': '1rem',
  		'5': '1.25rem',
  		'6': '1.5rem',
  		'7': '1.75rem',
  		'8': '2rem',
  		'9': '2.25rem',
  		'10': '2.5rem',
  		'11': '2.75rem',
  		'12': '3rem',
  		'14': '3.5rem',
  		'16': '4rem',
  		'18': '4.5rem',
  		'20': '5rem',
  		'22': '5.5rem',
  		'24': '6rem',
  		'28': '7rem',
  		'32': '8rem',
  		'36': '9rem',
  		'40': '10rem',
  		'44': '11rem',
  		'48': '12rem',
  		'52': '13rem',
  		'56': '14rem',
  		'60': '15rem',
  		'64': '16rem',
  		'72': '18rem',
  		'80': '20rem',
  		'96': '24rem',
  		px: '1px',
  		'0.5': '0.125rem'
  	},
  	fontFamily: {
  		sans: [
  			'geist'
  		],
  		mono: [
  			'geist-mono'
  		]
  	},
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			sm: '1.5rem',
  			lg: '2rem'
  		},
  		screens: {
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1024px'
  		}
  	},
  	extend: {
  		minHeight: {
  			touch: '2.75rem',
  			'touch-lg': '3rem',
  			'touch-xl': '3.5rem'
  		},
  		minWidth: {
  			touch: '2.75rem',
  			'touch-lg': '3rem',
  			'touch-xl': '3.5rem'
  		},
  		maxWidth: {
  			readable: '65ch',
  			content: '50rem',
  			wide: '75rem',
  			ultrawide: '90rem'
  		},
  		lineHeight: {
  			baseline: '1.5rem',
  			'baseline-2': '3rem',
  			'baseline-3': '4.5rem'
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '3rem'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '3rem'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '4.5rem'
  				}
  			],
  			'7xl': [
  				'4.5rem',
  				{
  					lineHeight: '4.5rem'
  				}
  			]
  		},
  		transitionDuration: {
  			'400': '400ms'
  		},
  		transitionTimingFunction: {
  			smooth: 'cubic-bezier(0.23, 1, 0.32, 1)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		zIndex: {
  			dropdown: '1000',
  			sticky: '1100',
  			fixed: '1200',
  			'modal-backdrop': '1300',
  			modal: '1400',
  			popover: '1500',
  			tooltip: '1600'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
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
/**
 * Type-safe spacing constants that map to Tailwind classes
 * Use these for consistent spacing decisions throughout the app
 */

// Semantic spacing mappings
export const spacing = {
  // Component padding
  card: {
    compact: 'p-4',        // 16px
    default: 'p-6',        // 24px
    spacious: 'p-8',       // 32px
    responsive: 'p-4 sm:p-6 lg:p-8',
  },

  // Button padding (follows 2-3x horizontal rule)
  button: {
    sm: 'px-4 py-2',       // 16px × 8px (2x)
    default: 'px-6 py-2.5', // 24px × 10px (~2.5x)
    lg: 'px-8 py-3',       // 32px × 12px (~2.5x)
    xl: 'px-10 py-4',      // 40px × 16px (2.5x)
  },

  // Form spacing
  form: {
    fieldGap: 'space-y-6',          // 24px between fields
    sectionGap: 'space-y-12',       // 48px between sections
    labelGap: 'space-y-2',          // 8px label to input
    helperGap: 'mt-2',              // 8px below input
  },

  // Section spacing
  section: {
    sm: 'py-12 sm:py-16',           // 48px → 64px
    default: 'py-16 sm:py-20',       // 64px → 80px
    lg: 'py-20 sm:py-24',           // 80px → 96px
    hero: 'fluid-section-lg',       // Fluid 64px → 128px
  },

  // Grid/Flex gaps
  gap: {
    tight: 'gap-2',                 // 8px
    default: 'gap-4',               // 16px
    relaxed: 'gap-6',               // 24px
    loose: 'gap-8',                 // 32px
    responsive: 'gap-4 sm:gap-6 lg:gap-8',
  },

  // Container padding
  container: {
    default: 'px-4 sm:px-6 lg:px-8', // 16px → 24px → 32px
    fluid: 'fluid-container',         // clamp(16px, 4vw, 32px)
  },

  // Typography spacing
  text: {
    paragraphGap: 'mb-6',           // 24px between paragraphs
    headingGap: 'mb-4',             // 16px after headings
    listGap: 'space-y-2',           // 8px between list items
    inlineGap: 'gap-2',             // 8px between inline elements
  },

  // Touch targets
  touch: {
    default: 'min-h-[44px] min-w-[44px]',  // WCAG AA
    lg: 'min-h-[48px] min-w-[48px]',       // Recommended
    xl: 'min-h-[56px] min-w-[56px]',       // Comfortable
  },
} as const

// Type helper for spacing values
export type SpacingKey = keyof typeof spacing
export type SpacingValue<K extends SpacingKey> = keyof typeof spacing[K]

// Validation helper
export function getSpacing<K extends SpacingKey>(
  category: K,
  size: SpacingValue<K> = 'default' as SpacingValue<K>
): string {
  return spacing[category][size] as string
}

// Responsive breakpoint helpers
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Touch target validator (for development)
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= 44 && rect.height >= 44
}

// Combine multiple spacing classes
export function combineSpacing(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Get responsive spacing classes
export function getResponsiveSpacing(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  const classes = [base]
  if (sm) classes.push(`sm:${sm}`)
  if (md) classes.push(`md:${md}`)
  if (lg) classes.push(`lg:${lg}`)
  if (xl) classes.push(`xl:${xl}`)
  return classes.join(' ')
}

// Spacing scale reference (for documentation)
export const spacingScale = {
  '0': '0px',
  '0.5': '2px',   // Use sparingly
  '1': '4px',     // Use sparingly
  '2': '8px',     // ✓ Base unit
  '3': '12px',    // Avoid
  '4': '16px',    // ✓
  '5': '20px',    // Avoid
  '6': '24px',    // ✓
  '7': '28px',    // Avoid
  '8': '32px',    // ✓
  '9': '36px',    // Avoid
  '10': '40px',   // ✓
  '11': '44px',   // ✓ Touch target minimum
  '12': '48px',   // ✓
  '14': '56px',   // ✓
  '16': '64px',   // ✓
  '18': '72px',   // ✓
  '20': '80px',   // ✓
  '22': '88px',   // ✓
  '24': '96px',   // ✓
  '28': '112px',  // ✓
  '32': '128px',  // ✓
} as const

// Common patterns for quick reference
export const patterns = {
  // Page layouts
  pageContainer: 'container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  heroSection: 'fluid-section-lg text-center',
  contentSection: 'py-16 sm:py-20',

  // Component layouts
  cardGrid: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
  buttonGroup: 'flex items-center gap-4',
  formLayout: 'space-y-6',

  // Typography
  headingWithContent: 'mb-4',
  paragraphSpacing: 'mb-6',

  // Responsive patterns
  responsivePadding: 'p-4 sm:p-6 lg:p-8',
  responsiveGap: 'gap-4 sm:gap-6 lg:gap-8',
} as const
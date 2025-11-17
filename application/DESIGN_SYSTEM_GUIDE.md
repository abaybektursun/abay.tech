# 🎨 Design System & Architecture Guide
## **Building Scalable, Federated Applications with Superior Spacing**

---

## Table of Contents

1. [Spacing System Overview](#spacing-system-overview)
2. [Core Design Principles](#core-design-principles)
3. [Component Architecture](#component-architecture)
4. [Extending the Design System](#extending-the-design-system)
5. [Federating Applications](#federating-applications)
6. [Modular Usage Patterns](#modular-usage-patterns)
7. [Quick Reference](#quick-reference)
8. [Best Practices](#best-practices)

---

## Spacing System Overview

### The Foundation: 8-Point Grid

Our spacing system is built on a mathematical 8-point grid that ensures visual harmony across all interfaces. Every spacing value is a multiple of 8 pixels, creating predictable, scalable relationships.

```typescript
// Core spacing scale (tailwind.config.ts)
spacing: {
  0: '0',
  2: '0.5rem',   // 8px - Base unit
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}
```

### Semantic Spacing Tokens

Rather than using raw spacing values, we provide semantic tokens that convey intent:

```typescript
// From src/lib/spacing.ts
export const spacing = {
  card: {
    compact: 'p-4',        // 16px - Dense layouts
    default: 'p-6',        // 24px - Standard
    spacious: 'p-8',       // 32px - Breathing room
    responsive: 'p-4 sm:p-6 lg:p-8', // Adaptive
  },

  section: {
    sm: 'py-12 sm:py-16',     // 48px → 64px
    default: 'py-16 sm:py-20', // 64px → 80px
    lg: 'py-20 sm:py-24',     // 80px → 96px
    hero: 'fluid-section-lg',  // Fluid scaling
  },

  gap: {
    tight: 'gap-2',     // 8px - Related items
    default: 'gap-4',   // 16px - Standard
    relaxed: 'gap-6',   // 24px - Loose grouping
    loose: 'gap-8',     // 32px - Separated
  }
}
```

### Accessibility-First Touch Targets

Every interactive element meets WCAG AA standards with minimum 44px touch targets:

```typescript
// Button heights
default: "h-11"  // 44px - Minimum accessible
lg: "h-12"       // 48px - Comfortable
xl: "h-14"       // 56px - Spacious
```

---

## Core Design Principles

### 1. **Simplicity Over Complexity**
- Use Tailwind's native utilities
- Avoid custom CSS systems
- Leverage CVA for variants
- Single source of truth (tailwind.config.ts)

### 2. **Progressive Enhancement**
- Start with mobile (base styles)
- Enhance for larger screens
- Fluid spacing only where valuable
- Static by default, dynamic by choice

### 3. **Type Safety**
- TypeScript constants for spacing
- CVA for component variants
- Strict prop interfaces
- Compile-time validation

### 4. **Component Composition**
- Small, focused components
- Composable building blocks
- Consistent prop APIs
- Predictable behavior

---

## Component Architecture

### Base Component Pattern

Every component follows this structure:

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define variants with CVA
const componentVariants = cva(
  "base-classes-here",
  {
    variants: {
      size: {
        sm: "size-sm-classes",
        default: "size-default-classes",
        lg: "size-lg-classes",
      },
      spacing: {
        compact: "spacing-compact",
        default: "spacing-default",
        spacious: "spacing-spacious",
      }
    },
    defaultVariants: {
      size: "default",
      spacing: "default",
    },
  }
)

// 2. Define TypeScript interface
interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

// 3. Create forwarded ref component
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, size, spacing, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          componentVariants({ size, spacing }),
          className
        )}
        {...props}
      />
    )
  }
)

Component.displayName = "Component"

export { Component, componentVariants }
```

### Component Hierarchy

```
ui/                     # Base UI primitives
├── button.tsx          # Core interactive element
├── card.tsx            # Container component
├── input.tsx           # Form inputs
├── typography.tsx      # Text components
└── form-field.tsx      # Form composition

layout/                 # Layout components
├── page-section.tsx    # Page structure
├── grid-section.tsx    # Grid layouts
└── container.tsx       # Responsive container

features/               # Feature-specific
├── self-help/          # Self-help components
├── portfolio/          # Portfolio components
└── journal/            # Journal components
```

---

## Extending the Design System

### Adding New Spacing Values

If you need a specific spacing value not in the scale:

```typescript
// tailwind.config.ts
spacing: {
  // ... existing values
  18: '4.5rem',  // 72px - New value
}

// Update spacing.ts semantic tokens
export const spacing = {
  // ... existing tokens
  header: {
    default: 'py-18', // Use new value
  }
}
```

### Creating New Components

Follow the component template:

```tsx
// src/components/ui/new-component.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const newComponentVariants = cva(
  // Base styles - always applied
  "rounded-lg border transition-colors",
  {
    variants: {
      // Visual variants
      variant: {
        default: "bg-background",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary",
      },
      // Spacing variants
      spacing: {
        compact: "p-4",
        default: "p-6",
        spacious: "p-8",
        responsive: "p-4 sm:p-6 lg:p-8",
      },
      // Size variants
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      }
    },
    // Compound variants for complex states
    compoundVariants: [
      {
        variant: "primary",
        size: "lg",
        className: "font-bold",
      }
    ],
    defaultVariants: {
      variant: "default",
      spacing: "default",
      size: "default",
    },
  }
)

interface NewComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newComponentVariants> {
  // Additional custom props
  icon?: React.ReactNode
  title?: string
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant, spacing, size, icon, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          newComponentVariants({ variant, spacing, size }),
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4">{icon}</div>
        )}
        {title && (
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
        )}
        {children}
      </div>
    )
  }
)

NewComponent.displayName = "NewComponent"

export { NewComponent, newComponentVariants }
```

### Adding Responsive Variants

Use Tailwind's responsive modifiers systematically:

```tsx
// Responsive spacing in components
const responsiveComponent = cva(
  "base",
  {
    variants: {
      spacing: {
        // Mobile-first responsive design
        responsive: cn(
          "p-4",      // Mobile: 16px
          "sm:p-6",   // Tablet: 24px
          "lg:p-8",   // Desktop: 32px
          "xl:p-10"   // Large: 40px
        )
      }
    }
  }
)

// Fluid spacing for special cases
const fluidHero = cn(
  "fluid-section-lg",  // clamp(4rem, 10vw, 8rem)
  "text-center",
  "relative"
)
```

### Creating Theme Variations

Extend the color system while maintaining spacing consistency:

```typescript
// tailwind.config.ts
colors: {
  // Add new theme colors
  brand: {
    50: 'hsl(var(--brand-50))',
    100: 'hsl(var(--brand-100))',
    // ... full scale
    900: 'hsl(var(--brand-900))',
  }
}

// CSS variables in globals.css
:root {
  --brand-50: 270 100% 98%;
  --brand-100: 270 95% 95%;
  /* ... */
}

.dark {
  --brand-50: 270 20% 10%;
  --brand-100: 270 25% 15%;
  /* ... */
}
```

---

## Federating Applications

### Micro-Frontend Architecture

Structure your app as a federation of smaller, independent applications:

```
src/
├── app/                           # Main app shell
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── apps/                     # Federated apps mount point
│       ├── self-help/            # Self-help micro-app
│       │   ├── layout.tsx       # App-specific layout
│       │   ├── page.tsx         # App landing
│       │   └── needs-assessment/# Feature within app
│       ├── portfolio/            # Portfolio micro-app
│       │   ├── layout.tsx
│       │   └── [project]/       # Dynamic routes
│       └── journal/              # Journal micro-app
│           ├── layout.tsx
│           └── entries/
```

### Micro-App Template

Each federated app follows this structure:

```tsx
// src/app/apps/[app-name]/layout.tsx
import { AppProvider } from './providers'
import { AppNavigation } from './components/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen">
        <AppNavigation />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AppProvider>
  )
}

// src/app/apps/[app-name]/providers.tsx
'use client'

import { createContext, useContext } from 'react'

interface AppContextType {
  // App-specific state
}

const AppContext = createContext<AppContextType>({})

export function AppProvider({ children }: { children: React.ReactNode }) {
  // App-specific logic
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
```

### Shared Component Library

Create a shared component library for federated apps:

```typescript
// src/lib/shared/components/index.ts
export * from '@/components/ui/button'
export * from '@/components/ui/card'
export * from '@/components/ui/typography'
export * from '@/components/layout/page-section'

// App-specific components extend shared ones
// src/app/apps/self-help/components/needs-card.tsx
import { Card } from '@/lib/shared/components'

export function NeedsCard({ need, ...props }) {
  return (
    <Card spacing="responsive" {...props}>
      {/* App-specific content */}
    </Card>
  )
}
```

### App Registry Pattern

Register and discover federated apps dynamically:

```typescript
// src/lib/apps/registry.ts
export interface AppConfig {
  id: string
  name: string
  description: string
  icon: React.ComponentType
  href: string
  status: 'live' | 'beta' | 'coming-soon'
  features: string[]
  permissions?: string[]
}

const appRegistry = new Map<string, AppConfig>()

export function registerApp(config: AppConfig) {
  appRegistry.set(config.id, config)
}

export function getApp(id: string): AppConfig | undefined {
  return appRegistry.get(id)
}

export function getAllApps(): AppConfig[] {
  return Array.from(appRegistry.values())
}

// Auto-register apps
import selfHelpConfig from '@/app/apps/self-help/config'
import portfolioConfig from '@/app/apps/portfolio/config'

registerApp(selfHelpConfig)
registerApp(portfolioConfig)
```

### Inter-App Communication

Use event-driven architecture for app communication:

```typescript
// src/lib/apps/event-bus.ts
type EventHandler = (data: any) => void

class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map()

  on(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
  }

  off(event: string, handler: EventHandler) {
    this.events.get(event)?.delete(handler)
  }

  emit(event: string, data?: any) {
    this.events.get(event)?.forEach(handler => handler(data))
  }
}

export const appEventBus = new EventBus()

// Usage in apps
appEventBus.on('needs:updated', (data) => {
  // React to needs assessment updates
})

appEventBus.emit('needs:updated', { needs: [...] })
```

---

## Modular Usage Patterns

### 1. Component Composition Pattern

Build complex UIs from simple components:

```tsx
// Compose smaller components into larger ones
export function ArticleCard({ article }) {
  return (
    <Card spacing="responsive">
      <CardHeader>
        <Badge variant={article.status}>{article.category}</Badge>
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>{article.excerpt}</CardDescription>
      </CardHeader>

      <CardContent spacing="default">
        <Text>{article.content}</Text>
      </CardContent>

      <CardFooter>
        <ButtonGroup>
          <Button variant="default">Read More</Button>
          <Button variant="outline">Share</Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  )
}
```

### 2. Layout Composition Pattern

Create consistent page layouts:

```tsx
// Standard page layout
export function FeaturePage({ title, subtitle, children }) {
  return (
    <PageSection spacing="lg">
      <HeroSection title={title} subtitle={subtitle} />

      <ContentSection>
        <GridSection columns={3}>
          {children}
        </GridSection>
      </ContentSection>

      <CTASection
        title="Ready to get started?"
        description="Join thousands of users"
      >
        <Button size="lg">Get Started</Button>
      </CTASection>
    </PageSection>
  )
}
```

### 3. Variant Composition Pattern

Combine variants for specific use cases:

```tsx
// Create specialized components from base ones
export function PrimaryButton(props: ButtonProps) {
  return <Button variant="default" size="lg" {...props} />
}

export function CompactCard(props: CardProps) {
  return <Card spacing="compact" {...props} />
}

export function HeroTitle(props: HeadingProps) {
  return <Heading level="h1" responsive {...props} />
}
```

### 4. Provider Pattern for Shared State

Wrap sections with context providers:

```tsx
// Spacing context for section-wide consistency
const SpacingContext = createContext<'compact' | 'default' | 'spacious'>('default')

export function SpacingProvider({
  children,
  spacing = 'default'
}: {
  children: React.ReactNode
  spacing?: 'compact' | 'default' | 'spacious'
}) {
  return (
    <SpacingContext.Provider value={spacing}>
      {children}
    </SpacingContext.Provider>
  )
}

// Components use context spacing
export function ContextAwareCard(props) {
  const spacing = useContext(SpacingContext)
  return <Card spacing={spacing} {...props} />
}
```

### 5. Factory Pattern for Dynamic Components

Generate components based on configuration:

```tsx
// Component factory
export function createThemedComponent<T extends React.ComponentType<any>>(
  Component: T,
  defaultProps: Partial<React.ComponentProps<T>>
) {
  return React.forwardRef((props, ref) => {
    return <Component ref={ref} {...defaultProps} {...props} />
  })
}

// Create themed variants
export const BrandButton = createThemedComponent(Button, {
  variant: 'default',
  className: 'bg-brand-500 hover:bg-brand-600'
})

export const CompactSection = createThemedComponent(PageSection, {
  spacing: 'sm'
})
```

---

## Quick Reference

### Spacing Cheat Sheet

```typescript
// Padding/Margin
p-2   // 8px
p-4   // 16px
p-6   // 24px ✓ Default card padding
p-8   // 32px
p-12  // 48px
p-16  // 64px

// Gap (Flexbox/Grid)
gap-2  // 8px - Tight grouping
gap-4  // 16px - Standard ✓
gap-6  // 24px - Relaxed
gap-8  // 32px - Loose

// Responsive
p-4 sm:p-6 lg:p-8  // 16px → 24px → 32px

// Fluid (Hero sections only)
fluid-section-lg   // clamp(4rem, 10vw, 8rem)
fluid-hero        // clamp(2.5rem, 5vw + 1rem, 4rem)
```

### Component Props Quick Reference

```typescript
// Button
<Button
  variant="default | destructive | outline | secondary | ghost | link"
  size="sm | default | lg | xl | icon | icon-sm | icon-lg"
/>

// Card
<Card
  spacing="compact | default | spacious | responsive"
  container={true}  // Enable container queries
/>

// Typography
<Heading
  level="h1 | h2 | h3 | h4 | h5 | h6"
  responsive={true}
/>

<Text
  size="sm | base | lg"
  muted={true}
/>

// Form Fields
<FormGroup spacing="tight | default | loose">
  <FormField label="Name" required>
    <Input />
  </FormField>
</FormGroup>

// Page Sections
<PageSection
  spacing="sm | default | lg | hero"
  background="default | muted | accent"
  container={true}
/>
```

### File Structure Template

```
src/app/apps/[new-app]/
├── config.ts              # App configuration
├── layout.tsx             # App layout wrapper
├── page.tsx               # Landing page
├── providers.tsx          # Context providers
├── components/            # App-specific components
│   ├── navigation.tsx
│   └── [feature].tsx
├── features/              # Feature modules
│   └── [feature]/
│       ├── page.tsx
│       └── components/
├── hooks/                 # Custom hooks
│   └── use-[feature].ts
├── lib/                   # Utilities
│   └── [feature]-utils.ts
└── types/                 # TypeScript types
    └── index.ts
```

---

## Best Practices

### Do's ✅

1. **Use semantic spacing tokens** instead of raw values
   ```tsx
   // Good
   <Card spacing="responsive">

   // Bad
   <Card className="p-4 sm:p-6 lg:p-8">
   ```

2. **Compose from primitives**
   ```tsx
   // Good - Compose existing components
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
   </Card>
   ```

3. **Maintain 44px minimum touch targets**
   ```tsx
   // Good
   <Button size="default">  // h-11 = 44px
   ```

4. **Use CVA for variants**
   ```tsx
   // Good
   const variants = cva("base", {
     variants: { size: { sm: "...", lg: "..." }}
   })
   ```

5. **Follow 8-point grid**
   ```tsx
   // Good - All multiples of 8
   gap-2 (8px), gap-4 (16px), gap-6 (24px)
   ```

### Don'ts ❌

1. **Don't use arbitrary values**
   ```tsx
   // Bad
   className="p-[17px]"  // Not on grid
   ```

2. **Don't mix spacing systems**
   ```tsx
   // Bad
   className="p-4 ml-[10px] gap-3"  // Inconsistent
   ```

3. **Don't override touch targets**
   ```tsx
   // Bad
   <Button className="h-8">  // 32px - too small
   ```

4. **Don't create one-off components**
   ```tsx
   // Bad - Too specific
   function MyVerySpecificCard() { ... }
   ```

5. **Don't use inline styles for spacing**
   ```tsx
   // Bad
   style={{ padding: '20px' }}
   ```

### Performance Tips

1. **Use Tailwind JIT** - Only generates used classes
2. **Avoid runtime calculations** - Use static classes when possible
3. **Leverage CSS custom properties** for theming, not spacing
4. **Use container queries** sparingly - They have performance cost
5. **Prefer transform over position** for animations

### Accessibility Checklist

- [ ] All buttons ≥ 44px height
- [ ] Touch targets have adequate spacing
- [ ] Form fields ≥ 44px height
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Color contrast passes WCAG AA
- [ ] Responsive text remains readable

### Migration Guide

When migrating existing components:

1. **Audit current spacing** - List all unique values
2. **Map to 8-point grid** - Find nearest grid value
3. **Create CVA variants** - Replace inline classes
4. **Update imports** - Use new components
5. **Test responsiveness** - Verify all breakpoints
6. **Check accessibility** - Run automated tests

```tsx
// Before migration
<div className="p-5 mb-7 rounded-md">
  <button className="px-3 py-1.5 h-9">Click</button>
</div>

// After migration
<Card spacing="default">
  <Button size="default">Click</Button>
</Card>
```

---

## Resources & Tools

### Development Tools

- **Tailwind IntelliSense** - VS Code extension for class suggestions
- **CVA** - Class variance authority for variants
- **clsx** - Utility for constructing className strings
- **tailwind-merge** - Intelligently merge Tailwind classes

### Testing Tools

- **Lighthouse** - Performance and accessibility auditing
- **Axe DevTools** - Accessibility testing
- **WAVE** - Web accessibility evaluation
- **Storybook** - Component documentation and testing

### Design Tools

- **Figma** - Design with 8-point grid templates
- **Utopia.fyi** - Fluid typography calculator
- **ModularScale.com** - Modular scale calculator
- **Polypane** - Multi-viewport testing

### Documentation

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [CVA Documentation](https://cva.style/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Spacing](https://m3.material.io/foundations/layout/applying-layout)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)

---

## Conclusion

This design system provides a **solid foundation** for building scalable, accessible, and beautiful applications. By following these patterns and principles, you can:

- **Maintain consistency** across all interfaces
- **Scale efficiently** with federated architecture
- **Ensure accessibility** for all users
- **Develop faster** with reusable components
- **Reduce complexity** through systematic design

The key to success is **discipline** - stick to the system, resist one-off solutions, and continuously refine based on real usage patterns.

Remember: **Great design systems are living documents**. Update this guide as your system evolves, document new patterns as they emerge, and share learnings with your team.

---

*Last Updated: November 2024*
*Version: 1.0.0*
*Contributors: Design System Team*
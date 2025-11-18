import * as React from "react"
import { cn } from "@/lib/utils"
import Container from "@/components/container"
import { Heading } from "@/components/ui/typography"

interface PageSectionProps {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'default' | 'lg' | 'hero'
  container?: boolean
  background?: 'default' | 'muted' | 'accent'
}

export function PageSection({
  children,
  className,
  spacing = 'default',
  container = true,
  background = 'default'
}: PageSectionProps) {
  const spacingClasses = {
    sm: 'py-12 sm:py-16',        // 48px → 64px
    default: 'py-16 sm:py-20',    // 64px → 80px
    lg: 'py-20 sm:py-24',        // 80px → 96px
    hero: 'fluid-section-lg',    // clamp(64px, 10vw, 128px)
  }

  const backgroundClasses = {
    default: '',
    muted: 'bg-muted/50',
    accent: 'bg-accent/50',
  }

  const content = container ? (
    <Container>{children}</Container>
  ) : children

  return (
    <section className={cn(
      spacingClasses[spacing],
      backgroundClasses[background],
      className
    )}>
      {content}
    </section>
  )
}

// Hero section with fluid typography
export function HeroSection({
  title,
  subtitle,
  children,
  className
}: {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <PageSection spacing="hero" className={cn("text-center", className)}>
      <div className="space-y-4 sm:space-y-6">
        <h1 className="fluid-hero font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="fluid-subtitle text-muted-foreground max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="pt-8">
            {children}
          </div>
        )}
      </div>
    </PageSection>
  )
}

// Content section with consistent spacing
export function ContentSection({
  title,
  children,
  className
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-8", className)}>
      {title && (
        <Heading level="h2" responsive>
          {title}
        </Heading>
      )}
      {children}
    </div>
  )
}

// Grid section for cards or items
export function GridSection({
  children,
  className,
  columns = 'responsive'
}: {
  children: React.ReactNode
  className?: string
  columns?: 'responsive' | 2 | 3 | 4
}) {
  const columnClasses = {
    'responsive': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn(
      "grid gap-6",
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}

// Feature section with icon, title, and description
export function FeatureSection({
  features,
  className,
  columns = 3
}: {
  features: Array<{
    icon?: React.ReactNode
    title: string
    description: string
  }>
  className?: string
  columns?: 2 | 3 | 4
}) {
  return (
    <GridSection columns={columns} className={className}>
      {features.map((feature, index) => (
        <div key={index} className="space-y-4">
          {feature.icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {feature.icon}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </GridSection>
  )
}

// CTA section
export function CTASection({
  title,
  description,
  children,
  className
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <PageSection
      spacing="lg"
      background="muted"
      className={className}
    >
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <Heading level="h2" responsive>
            {title}
          </Heading>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </PageSection>
  )
}
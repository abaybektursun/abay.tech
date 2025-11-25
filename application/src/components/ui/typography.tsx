import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Heading with vertical rhythm built-in (24px baseline)
const headingVariants = cva("font-bold", {
  variants: {
    level: {
      h1: "text-5xl leading-baseline-2 mb-8",    // 48px font, 48px line, 32px margin
      h2: "text-4xl leading-baseline-2 mb-6",    // 36px font, 48px line, 24px margin
      h3: "text-3xl leading-10 mb-4",            // 30px font, 40px line, 16px margin
      h4: "text-2xl leading-8 mb-4",             // 24px font, 32px line, 16px margin
      h5: "text-xl leading-7 mb-2",              // 20px font, 28px line, 8px margin
      h6: "text-lg leading-baseline mb-2",       // 18px font, 24px line, 8px margin
    },
    responsive: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      level: "h1",
      responsive: true,
      className: "text-4xl sm:text-5xl lg:text-6xl",
    },
    {
      level: "h2",
      responsive: true,
      className: "text-3xl sm:text-4xl lg:text-5xl",
    },
    {
      level: "h3",
      responsive: true,
      className: "text-2xl sm:text-3xl lg:text-4xl",
    },
  ],
  defaultVariants: {
    level: "h2",
    responsive: false,
  },
})

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = "h2", as, responsive, children, ...props }, ref) => {
    const Component = as || level || "h2"

    return React.createElement(
      Component,
      {
        ref: ref as any,
        className: cn(headingVariants({ level, responsive }), className),
        ...props
      },
      children
    )
  }
)
Heading.displayName = "Heading"

// Text components with baseline rhythm
export const Text = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'sm' | 'base' | 'lg'
    muted?: boolean
    as?: 'p' | 'span' | 'div'
  }
>(({ className, size = 'base', muted = false, as = 'p', ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-sm leading-5',      // 14px/20px
    base: 'text-base leading-baseline', // 16px/24px
    lg: 'text-lg leading-7',      // 18px/28px
  }

  const Component = as

  return React.createElement(
    Component,
    {
      ref: ref as any,
      className: cn(
        sizeClasses[size],
        muted && "text-muted-foreground",
        as === 'p' && "mb-6", // 24px margin for paragraphs
        className
      ),
      ...props
    }
  )
})
Text.displayName = "Text"

// Lead text for introductions
export const Lead = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xl leading-8 text-muted-foreground mb-6", className)}
    {...props}
  />
))
Lead.displayName = "Lead"

// List with proper spacing
export function List({
  children,
  className,
  spacing = 'default',
  type = 'unordered'
}: {
  children: React.ReactNode
  className?: string
  spacing?: 'tight' | 'default' | 'loose'
  type?: 'unordered' | 'ordered'
}) {
  const spacingClasses = {
    tight: 'space-y-1',    // 4px
    default: 'space-y-2',  // 8px
    loose: 'space-y-4',    // 16px
  }

  const Component = type === 'ordered' ? 'ol' : 'ul'
  const listClass = type === 'ordered' ? 'list-decimal' : 'list-disc'

  return (
    <Component className={cn(
      listClass,
      "list-inside",
      spacingClasses[spacing],
      "mb-6", // Maintain vertical rhythm
      className
    )}>
      {children}
    </Component>
  )
}

// Blockquote with proper spacing
export const Blockquote = React.forwardRef<
  HTMLQuoteElement,
  React.HTMLAttributes<HTMLQuoteElement>
>(({ className, ...props }, ref) => (
  <blockquote
    ref={ref}
    className={cn(
      "border-l-4 border-muted pl-6 italic text-muted-foreground my-6",
      className
    )}
    {...props}
  />
))
Blockquote.displayName = "Blockquote"

// Code block with proper spacing
export const Code = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    inline?: boolean
  }
>(({ className, inline = false, ...props }, ref) => {
  if (inline) {
    return (
      <code
        ref={ref}
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <pre
      ref={ref as React.Ref<HTMLPreElement>}
      className={cn(
        "rounded-lg bg-muted p-4 overflow-x-auto font-mono text-sm mb-6",
        className
      )}
      {...props}
    />
  )
})
Code.displayName = "Code"

// Small text
export const Small = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <small
    ref={ref}
    className={cn("text-xs leading-4", className)}
    {...props}
  />
))
Small.displayName = "Small"

// Muted text helper
export const Muted = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-muted-foreground", className)}
    {...props}
  />
))
Muted.displayName = "Muted"

// Typography container for consistent article/content spacing
export function TypographyContainer({
  children,
  className,
  prose = true
}: {
  children: React.ReactNode
  className?: string
  prose?: boolean
}) {
  return (
    <div className={cn(
      prose && "prose prose-neutral dark:prose-invert max-w-none",
      "[&>*:last-child]:mb-0", // Remove margin from last element
      className
    )}>
      {children}
    </div>
  )
}
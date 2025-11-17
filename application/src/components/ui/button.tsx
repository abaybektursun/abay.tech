import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-target",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",      // 44px height, perfect ratio
        sm: "h-11 min-w-[88px] px-4 py-2", // Still 44px for accessibility
        lg: "h-12 px-8 py-3 text-base",    // 48px height
        xl: "h-14 px-10 py-4 text-lg",     // 56px height (new size)
        icon: "h-11 w-11 p-0",             // 44×44px
        "icon-sm": "h-11 w-11 p-0 text-xs", // 44×44px with smaller icon
        "icon-lg": "h-12 w-12 p-0",        // 48×48px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Button group component for consistent spacing
const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: 'tight' | 'default' | 'loose'
    direction?: 'row' | 'column'
  }
>(({ className, spacing = 'default', direction = 'row', ...props }, ref) => {
  const spacingClasses = {
    tight: 'gap-2',     // 8px
    default: 'gap-4',   // 16px
    loose: 'gap-6',     // 24px
  }

  const directionClasses = {
    row: 'flex-row flex-wrap',
    column: 'flex-col',
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        spacingClasses[spacing],
        directionClasses[direction],
        className
      )}
      {...props}
    />
  )
})
ButtonGroup.displayName = "ButtonGroup"

export { Button, ButtonGroup, buttonVariants }

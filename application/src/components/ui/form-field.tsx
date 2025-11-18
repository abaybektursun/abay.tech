import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormFieldProps {
  label?: string
  error?: string
  helper?: string
  required?: boolean
  children?: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  helper,
  required,
  children,
  className
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {helper && !error && (
        <p className="text-sm text-muted-foreground mt-2">{helper}</p>
      )}
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  )
}

// Form group for organizing fields
export function FormGroup({
  children,
  className,
  spacing = 'default'
}: {
  children: React.ReactNode
  className?: string
  spacing?: 'tight' | 'default' | 'loose'
}) {
  const spacingClasses = {
    tight: 'space-y-4',    // 16px
    default: 'space-y-6',  // 24px
    loose: 'space-y-8',    // 32px
  }

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  )
}

// Form section for major divisions
export function FormSection({
  title,
  description,
  children,
  className
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// Form actions footer
export function FormActions({
  children,
  className,
  alignment = 'right'
}: {
  children: React.ReactNode
  className?: string
  alignment?: 'left' | 'center' | 'right' | 'between'
}) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div className={cn(
      "flex items-center gap-4 pt-8",
      alignmentClasses[alignment],
      className
    )}>
      {children}
    </div>
  )
}

// Form row for horizontal layouts
export function FormRow({
  children,
  className,
  columns = 2
}: {
  children: React.ReactNode
  className?: string
  columns?: 2 | 3 | 4
}) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn(
      "grid gap-4",
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}
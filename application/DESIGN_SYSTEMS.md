# Design System Architecture

## Overview
This application uses **two separate design systems** to provide optimal experiences for different parts of the application:

1. **Portfolio Design System** - For the main website
2. **AI Chat Design System** - For AI-powered chat interfaces

## Directory Structure

```
/components/
├── /portfolio/          # Portfolio site components
│   ├── button.tsx       # 44px touch targets, wellness colors
│   ├── card.tsx
│   ├── bento-grid.tsx
│   └── ...
│
├── /ai/                 # AI chat components ONLY
│   ├── conversation.tsx
│   ├── message.tsx
│   ├── prompt-input.tsx
│   └── ...
│
└── /primitives/        # Shared Radix UI primitives
    └── dropdown-menu.tsx # Basic dropdown (no styling opinions)
```

## Portfolio Design System

**Used for:** `/`, `/blog`, `/about`, `/apps` (landing pages)

### Characteristics:
- **Components:** `/components/portfolio/`
- **Styles:** `globals.css`
- **CSS Namespace:** `.portfolio-app` (if needed)
- **Touch targets:** 44px minimum (WCAG AA)
- **Colors:** Wellness palette
  - Primary: Purple `262 83% 57%`
  - Accents: Sage greens, coral pinks
- **Border radius:** 0.75rem (12px)
- **Font sizes:** Larger, more spacious

### Example Usage:
```tsx
import { Button } from '@/components/portfolio/button'
import { Card } from '@/components/portfolio/card'
```

## AI Chat Design System

**Used for:** `/apps/growth-tools/*` (chat interfaces)

### Characteristics:
- **Components:** `/components/ai/`
- **Styles:** `ai-chat.css`
- **CSS Namespace:** `.ai-chat` (required wrapper)
- **Touch targets:** 32px (ChatGPT-like)
- **Colors:** Neutral palette
  - Primary: Blue `230 70% 46%`
  - Grays: Neutral (0% saturation)
- **Border radius:** 0.625rem (10px)
- **Font sizes:** Compact, efficient

### Example Usage:
```tsx
import { Message } from '@/components/ai/message'
import { PromptInput } from '@/components/ai/prompt-input'
```

## Import Rules

### ✅ ALLOWED
```tsx
// In portfolio pages
import { Button } from '@/components/portfolio/button'

// In AI chat pages
import { Message } from '@/components/ai/message'

// Shared primitives (anywhere)
import { DropdownMenu } from '@/components/primitives/dropdown-menu'
```

### ❌ FORBIDDEN
```tsx
// In AI pages - NO portfolio imports!
import { Button } from '@/components/portfolio/button' // ❌

// In portfolio pages - NO AI imports!
import { Message } from '@/components/ai/message' // ❌
```

## Layout Enforcement

The design system is enforced at the layout level:

```tsx
// /app/layout.tsx - Main site
export default function RootLayout({ children }) {
  return (
    <html>
      <body className="portfolio-app">
        {children}
      </body>
    </html>
  )
}

// /app/apps/layout.tsx - AI apps
export default function AppsLayout({ children }) {
  return (
    <div className="ai-chat">
      {children}
    </div>
  )
}
```

## CSS Variables

### Portfolio System
```css
--radius: 0.75rem;           /* 12px */
--primary: 262 83% 57%;      /* Purple */
--border: 240 5.9% 90%;      /* Purple-tinted */
```

### AI Chat System
```css
.ai-chat {
  --radius: 0.625rem;        /* 10px */
  --primary: 230 70% 46%;    /* Blue */
  --border: 0 0% 89.8%;      /* Pure neutral */
}
```

## Development Guidelines

1. **Never mix systems** - A page uses one OR the other, never both
2. **Check imports** - Use ESLint rules to prevent cross-imports
3. **Respect boundaries** - Portfolio for brand, AI for chat
4. **Use primitives sparingly** - Only for truly shared, unstyled components

## Migration Checklist

When adding new features:

- [ ] Determine which design system applies
- [ ] Import from the correct component directory
- [ ] Use the appropriate CSS namespace
- [ ] Verify no cross-system imports
- [ ] Test in both light and dark modes

## Common Mistakes to Avoid

1. **Importing Button from portfolio in AI pages** - Creates size/color conflicts
2. **Using ai-chat class outside /apps** - Overwrites portfolio styles
3. **Mixing touch target sizes** - Creates inconsistent UX
4. **Sharing styled components** - Use primitives for shared needs

## Future Considerations

- Consider implementing ESLint rules to enforce import boundaries
- Add TypeScript path aliases to make system choice explicit
- Consider Storybook with separate sections for each system
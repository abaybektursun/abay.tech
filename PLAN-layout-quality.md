# Plan: Production-Quality Layout Architecture

## Goal
Bring the layout system to top-tier production quality by integrating with existing CSS architecture, adding proper responsive design, design tokens, and accessibility.

---

## Phase 1: Unified Design Tokens (CSS Variables)

**Problem:** Magic values scattered everywhere (`w-48`, `gap-8`, `top-24`, `h-6`)

**Solution:** Create a single source of truth in CSS

### 1.1 Add layout tokens to `globals.css`
```css
:root {
  /* Layout */
  --app-sidebar-width: 13rem;
  --app-content-gap: 2rem;
  --app-max-width: 72rem;
  --app-sticky-top: 6rem;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Sizing */
  --icon-sm: 0.75rem;
  --icon-md: 1rem;
  --icon-lg: 1.25rem;
  --button-icon-size: 1.5rem;
}
```

### 1.2 Add responsive overrides
```css
@media (max-width: 768px) {
  :root {
    --app-sidebar-width: 0;
    --app-content-gap: 0;
  }
}
```

### 1.3 Update components to use CSS variables
- Remove JS `LAYOUT` constants from `AppLayout.tsx` and `AppSidebar.tsx`
- Reference CSS variables via `var(--app-sidebar-width)`

---

## Phase 2: Proper Responsive Layout

**Problem:** Grid doesn't adapt to mobile; sidebar just hides

**Solution:** Mobile-first responsive grid

### 2.1 Update `AppLayout.tsx`
```tsx
// Mobile: single column
// Desktop (md+): sidebar + content
<div className="grid grid-cols-1 md:grid-cols-[var(--app-sidebar-width)_1fr] gap-[var(--app-content-gap)]">
```

### 2.2 Add mobile navigation
- Add hamburger menu for mobile
- Slide-out drawer for sidebar on mobile
- Or: collapsible bottom navigation

---

## Phase 3: Component Cleanup

**Problem:** Duplicated code in `ChatListItem`

### 3.1 Consolidate ChatListItem
```tsx
// Single component handles both pinned and unpinned
function ChatListItem({ chat, onTogglePin, onClick }: Props) {
  const isPinned = chat.pinned;
  // ... unified logic
}
```

### 3.2 Extract reusable patterns
- `IconButton` - consistent icon button styling
- `NavItem` - navigation item with icon + label
- `SectionHeader` - "Pinned", "Recent" section labels

---

## Phase 4: Accessibility

**Problem:** No keyboard navigation, missing ARIA labels

### 4.1 Add ARIA attributes
```tsx
<nav aria-label="Application navigation">
<button aria-label="Toggle chat list">
<ul role="list" aria-label="Chat history">
```

### 4.2 Keyboard navigation
- Arrow keys to navigate chat list
- Enter to select
- Escape to close dropdown

### 4.3 Focus management
- Focus trap in dropdowns
- Visible focus indicators
- Skip links

---

## Phase 5: Testing

**Problem:** Zero component tests

### 5.1 Add component tests
```
__tests__/
  AppLayout.test.tsx
  AppSidebar.test.tsx
  ChatListItem.test.tsx
```

### 5.2 Test coverage
- Renders correctly
- Responsive behavior
- Keyboard navigation
- Pin/unpin functionality
- Empty state

---

## Implementation Order

| Phase | Priority | Effort | Impact |
|-------|----------|--------|--------|
| 1. Design Tokens | High | Medium | High - fixes root cause |
| 2. Responsive | High | Medium | High - mobile is broken |
| 3. Component Cleanup | Medium | Low | Medium - maintainability |
| 4. Accessibility | High | Medium | High - legal/ethical requirement |
| 5. Testing | Medium | High | Medium - confidence |

**Recommended order:** 1 → 2 → 4 → 3 → 5

---

## Files to Modify

| File | Changes |
|------|---------|
| `globals.css` | Add design tokens |
| `ai-chat.css` | Add app-specific token overrides |
| `AppLayout.tsx` | Use CSS vars, responsive grid |
| `AppSidebar.tsx` | Use CSS vars, add ARIA, consolidate components |
| `page.tsx` | Mobile nav trigger |

## New Files

| File | Purpose |
|------|---------|
| `components/ui/icon-button.tsx` | Reusable icon button |
| `components/growth-tools/__tests__/*.tsx` | Component tests |

---

## Questions Before Proceeding

1. **Mobile nav preference:** Hamburger menu, bottom nav, or slide-out drawer?
2. **Testing framework:** Is Vitest already set up, or should I add it?
3. **Priority:** Should I tackle all phases, or start with Phase 1 only?

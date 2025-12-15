# Growth Tools Components

This directory contains the components for the Growth Tools application.

## Architecture

```
growth-tools/
├── AppLayout.tsx      # Main layout wrapper with sidebar + content grid
├── AppSidebar.tsx     # Navigation sidebar with chat list
├── GrowthToolChat.tsx # Chat interface for exercises
├── Dashboard.tsx      # User dashboard/analytics view
└── __tests__/         # Component tests
```

## Layout System

Layout dimensions are defined as CSS variables in `globals.css`:

```css
:root {
  --header-height: 5rem;
  --app-sidebar-width: 13rem;
  --app-content-gap: 2rem;
  --app-max-width: 72rem;
  --app-sticky-top: 6rem;
  --chat-list-height: 12.5rem;
}
```

This provides a single source of truth for layout measurements, making the design predictable and easy to modify.

## Important: Radix UI Dropdown Menu Behavior

### Problem: Layout Shift on Dropdown Open

Radix UI's `DropdownMenu` component has `modal={true}` by default, which:
1. Locks background scroll when the dropdown opens
2. Uses `react-remove-scroll` to add padding compensation for the scrollbar
3. Conflicts with `scrollbar-gutter: stable` causing a "double-shift" where the page jumps

### Solution

**Always use `modal={false}` on DropdownMenu components:**

```tsx
// Good - prevents layout shift
<DropdownMenu modal={false}>
  <DropdownMenuTrigger>...</DropdownMenuTrigger>
  <DropdownMenuContent>...</DropdownMenuContent>
</DropdownMenu>

// Bad - causes page to jump when opened
<DropdownMenu>
  ...
</DropdownMenu>
```

This is applied in:
- `AppSidebar.tsx` - Chat options menu (pin/delete)
- `GrowthToolChat.tsx` - Attach button menu

### Why This Works

Setting `modal={false}` tells Radix:
- Don't lock background scroll
- Don't add scrollbar compensation padding
- Allow interaction with elements outside the dropdown

This is appropriate for dropdown menus because users often want to scroll while a menu is open. Modal behavior is better suited for dialogs/alerts where you want focused attention.

### For Dialogs/Modals

For components that DO need modal behavior (AlertDialog, Dialog, Sheet), we have a CSS fix in `globals.css`:

```css
body[data-scroll-locked] {
  --removed-body-scroll-bar-size: 0px !important;
  margin-right: 0 !important;
}
```

This prevents the double-shift by telling Radix not to add its own scrollbar compensation since `scrollbar-gutter: stable` already handles it.

**Reference:** https://github.com/radix-ui/primitives/issues/3251

## Testing

Component tests are in `__tests__/AppSidebar.test.tsx`. Run with:

```bash
pnpm vitest run src/components/growth-tools/__tests__/
```

Tests cover:
- Navigation button rendering
- Chat list display (pinned/unpinned sections)
- Pin/unpin functionality
- Delete with confirmation dialog
- Mobile navigation (hamburger menu + Sheet)

'use client';

import { ReactNode } from 'react';

/**
 * LAYOUT CONSTANTS - Single source of truth
 *
 * All layout dimensions are defined here.
 * This makes the layout completely predictable and easy to modify.
 */
const LAYOUT = {
  /** Maximum content width */
  maxWidth: '1152px', // 6xl
  /** Gap between sidebar and main content */
  gap: '2rem', // 32px
  /** Sidebar width - matches AppSidebar LAYOUT.width */
  sidebarWidth: '13rem', // 208px = w-52
} as const;

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * AppLayout - Clean CSS Grid layout for sidebar + main content
 *
 * Uses CSS Grid with explicit column sizing for predictable behavior.
 * No nested flex containers or complex width calculations.
 *
 * Grid structure:
 * [sidebar: 208px] [gap: 32px] [main: 1fr]
 */
export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div
      className="mx-auto px-4"
      style={{ maxWidth: LAYOUT.maxWidth }}
    >
      {/*
        CSS Grid layout with explicit columns:
        - First column: fixed sidebar width
        - Second column: flexible main content
        - Gap handled by grid-gap, not margins/padding
      */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `${LAYOUT.sidebarWidth} 1fr`,
          gap: LAYOUT.gap,
        }}
      >
        {/* Sidebar - hidden on mobile via the sidebar component itself */}
        {sidebar}

        {/* Main content - isolated from sidebar with overflow hidden */}
        <main className="min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

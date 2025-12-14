'use client';

import { ReactNode } from 'react';

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * AppLayout - CSS Grid layout for sidebar + main content
 *
 * Layout dimensions are defined in globals.css as CSS variables:
 * - --app-max-width
 * - --app-sidebar-width
 * - --app-content-gap
 *
 * Grid structure (desktop):
 * [sidebar: var(--app-sidebar-width)] [gap] [main: 1fr]
 *
 * On mobile (< md): single column, sidebar hidden via AppSidebar
 */
export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div
      className="mx-auto px-4"
      style={{ maxWidth: 'var(--app-max-width)' }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-[var(--app-sidebar-width)_1fr]"
        style={{ gap: 'var(--app-content-gap)' }}
      >
        {sidebar}

        <main className="min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

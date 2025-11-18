'use client';

import { ReactNode } from 'react';
import Header from '@/components/header';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
  headerHeight?: string;
}

/**
 * AppShell provides the main layout structure for the application
 * It manages viewport height and ensures content doesn't overflow
 */
export function AppShell({
  children,
  className,
  headerHeight = '64px' // 8-point grid: 64px = 8 * 8
}: AppShellProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Fixed header */}
      <div className="flex-shrink-0 z-fixed">
        <Header />
      </div>

      {/* Scrollable content area that fills remaining height */}
      <main
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          "bg-background",
          className
        )}
        style={{
          height: `calc(100vh - ${headerHeight})`,
        }}
      >
        {children}
      </main>
    </div>
  );
}

/**
 * AppContent wrapper for consistent padding and max-width
 * Use this inside AppShell for page content
 */
export function AppContent({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "h-full",
      "container mx-auto",
      "px-4 sm:px-6 lg:px-8",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * FullHeightSection for sections that need to fill the viewport
 * Useful for hero sections or full-screen apps
 */
export function FullHeightSection({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "min-h-full flex flex-col",
      className
    )}>
      {children}
    </div>
  );
}
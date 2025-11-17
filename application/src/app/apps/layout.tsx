'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/ai-chat.css';

interface AppsLayoutProps {
  children: ReactNode;
}

export default function AppsLayout({ children }: AppsLayoutProps) {
  const pathname = usePathname();

  // Check if we're in an app (not the apps index page)
  const isInApp = pathname !== '/apps';

  if (isInApp) {
    // For actual apps, provide a full-height container minus header
    return (
      <div className="h-viewport ai-chat">
        {children}
      </div>
    );
  }

  // For the apps index page, use normal flow
  return <div className="ai-chat">{children}</div>;
}
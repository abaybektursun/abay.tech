'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { SessionProvider } from 'next-auth/react';
import { AuthButton } from '@/components/auth/auth-button';
import { Toaster } from '@/components/ui/sonner';
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
    // Use negative margin to cancel out the py-8 from root layout
    return (
      <SessionProvider>
        <div className="-my-8 h-[calc(100vh-var(--header-height))] ai-chat">
          <div className="absolute top-4 right-4 z-50">
            <AuthButton />
          </div>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
          <Toaster />
        </div>
      </SessionProvider>
    );
  }

  // For the apps index page, use normal flow
  return (
    <SessionProvider>
      <div className="ai-chat">
        <div className="absolute top-4 right-4 z-50">
          <AuthButton />
        </div>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
        <Toaster />
      </div>
    </SessionProvider>
  );
}
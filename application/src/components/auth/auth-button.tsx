'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [showHint, setShowHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show hint periodically for non-authenticated users
  useEffect(() => {
    if (session?.user || dismissed) return;

    // First appearance after 8 seconds
    const firstTimer = setTimeout(() => setShowHint(true), 8000);

    return () => clearTimeout(firstTimer);
  }, [session?.user, dismissed]);

  // Auto-hide after showing for 6 seconds, then show again later
  useEffect(() => {
    if (!showHint || dismissed) return;

    const hideTimer = setTimeout(() => {
      setShowHint(false);
      // Show again after 30 seconds
      if (!dismissed) {
        setTimeout(() => setShowHint(true), 30000);
      }
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, [showHint, dismissed]);

  const handleDismiss = () => {
    setShowHint(false);
    setDismissed(true);
  };

  if (status === 'loading') {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback>
                {session.user.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="relative">
      <Button onClick={() => signIn()} variant="secondary" size="sm">
        Sign In
      </Button>
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full right-0 mt-2 w-48 p-3 bg-popover border rounded-lg shadow-lg"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-1 right-2 text-muted-foreground/50 hover:text-muted-foreground text-xs"
            >
              ✕
            </button>
            <p className="text-xs text-muted-foreground pr-4">
              Sign in to keep your conversations
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

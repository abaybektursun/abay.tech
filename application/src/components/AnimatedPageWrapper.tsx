/**
 * AnimatedPageWrapper - Client component wrapper for adding animations to server components
 *
 * Why this exists:
 * Server components (async functions without 'use client') cannot use framer-motion directly
 * since animations require client-side JavaScript. This wrapper allows us to keep pages as
 * server components (for better performance, SEO, and data fetching) while still adding
 * beautiful animations to the content when it loads.
 *
 * Usage: Wrap server-rendered content with these components to add animations
 * without converting the entire page to a client component.
 */

'use client';

import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';
import { ReactNode } from 'react';

interface AnimatedPageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedPageWrapper({
  children,
  className = ''
}: AnimatedPageWrapperProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants.fadeIn}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

// Wrapper for sections that should have the gentle scale animation
export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  variant = 'gentleScale' as keyof typeof variants
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: keyof typeof variants;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}

// Wrapper for staggered children animations
export function AnimatedStaggerChildren({
  children,
  className = '',
  staggerDelay = 0.1
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Individual animated item for use in staggered animations
export function AnimatedItem({
  children,
  className = '',
  variant = 'softFadeUp' as keyof typeof variants
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variants;
}) {
  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
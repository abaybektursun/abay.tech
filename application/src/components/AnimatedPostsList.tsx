/**
 * AnimatedPostsList - Client wrapper for animating server-rendered posts
 *
 * Purpose: The /posts page is a server component (async function that fetches posts data)
 * which can't use framer-motion directly. This client wrapper adds animations to the
 * server-rendered content without sacrificing the benefits of server-side rendering.
 *
 * Animations: Provides gentleScale for the container and staggered softFadeUp for individual posts
 */

'use client';

import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';
import { ReactNode } from 'react';

interface Post {
  slug: string;
  title: string;
  subtitle: string;
  image?: string;
  date: string;
}

interface AnimatedPostsListProps {
  children: ReactNode;
  posts?: Post[];
}

export default function AnimatedPostsList({ children }: AnimatedPostsListProps) {
  return (
    <motion.div
      className="max-w-2xl mx-auto px-4"
      initial="hidden"
      animate="visible"
    >
      {/* Main content with gentle scale animation */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants.gentleScale}
        transition={{ ...transition, delay: 0.1 }}
      >
        {/* Posts with staggered fade up animation */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Export an animated post card wrapper for individual posts
export function AnimatedPostCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={variants.softFadeUp}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
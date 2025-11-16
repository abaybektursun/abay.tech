// src/components/container.tsx
'use client';

import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <motion.div
      className={className ? `container max-w-4xl mx-auto px-4 ${className}` : "container max-w-4xl mx-auto px-4"}
      initial="hidden"
      animate="visible"
      variants={variants.fadeIn}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
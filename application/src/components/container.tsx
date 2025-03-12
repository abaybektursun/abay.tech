// src/components/container.tsx
'use client';

import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';

type ContainerProps = {
  children: React.ReactNode;
};

export default function Container({ children }: ContainerProps) {
  return (
    <motion.div 
      className="container max-w-4xl m-auto px-4"
      initial="hidden"
      animate="visible"
      variants={variants.fadeIn}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
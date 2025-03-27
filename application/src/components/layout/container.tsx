// src/components/layout/container.tsx
'use client';

import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  animation?: boolean;
};

export default function Container({ 
  children, 
  className = "", 
  animation = true 
}: ContainerProps) {
  const baseClasses = "container max-w-4xl m-auto px-4";
  const combinedClasses = `${baseClasses} ${className}`;
  
  if (!animation) {
    return <div className={combinedClasses}>{children}</div>;
  }
  
  return (
    <motion.div 
      className={combinedClasses}
      initial="hidden"
      animate="visible"
      variants={variants.fadeIn}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
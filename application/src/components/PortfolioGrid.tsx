/**
 * PortfolioGrid - Netflix-style hover effect
 * Hovered card expands, neighbors shrink to make space
 * Simple, clean implementation using Framer Motion's official patterns
 */

'use client';

import { motion } from 'framer-motion';
import { ReactNode, useState, Children } from 'react';

export function PortfolioGrid({ children }: { children: ReactNode }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const childrenArray = Children.toArray(children);

  return (
    <div className="flex space-x-6 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x snap-mandatory">
      {childrenArray.map((child, index) => (
        <PortfolioCard
          key={index}
          index={index}
          hoveredIndex={hoveredIndex}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
        >
          {child}
        </PortfolioCard>
      ))}
    </div>
  );
}

interface PortfolioCardProps {
  children: ReactNode;
  index: number;
  hoveredIndex: number | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export function PortfolioCard({
  children,
  index,
  hoveredIndex,
  onHoverStart,
  onHoverEnd
}: PortfolioCardProps) {
  const baseScale = 0.97;

  const getScale = () => {
    if (hoveredIndex === null) return baseScale;
    if (index === hoveredIndex) return 1;

    const distance = Math.abs(index - hoveredIndex);
    if (distance === 1) return baseScale * 0.99;
    if (distance === 2) return baseScale * 0.995;
    return baseScale;
  };

  return (
    <motion.div
      className="flex-shrink-0 snap-start w-[15.3rem] sm:w-[17rem]"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: getScale()
      }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.22, ease: [0.4, 0, 0.2, 1] }
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {children}
    </motion.div>
  );
}
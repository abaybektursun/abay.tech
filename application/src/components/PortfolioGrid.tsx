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
  // Start all cards at 85% size, so they have room to expand
  const baseScale = 0.85;

  // Calculate scale based on proximity to hovered card
  const getScale = () => {
    if (hoveredIndex === null) return baseScale; // Default smaller size
    if (index === hoveredIndex) return 1; // Hovered expands to full size (safe max)

    const distance = Math.abs(index - hoveredIndex);
    if (distance === 1) return baseScale * 0.9; // Neighbors shrink more
    if (distance === 2) return baseScale * 0.95; // Further neighbors shrink less
    return baseScale; // Others stay at base size
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
        scale: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } // Extra smooth, gentle ease
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {children}
    </motion.div>
  );
}
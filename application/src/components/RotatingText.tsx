// src/components/RotatingText.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { textChange } from '@/lib/animations';

const titles = [
  "an AI consultant",
  "a friend",
  "a lover",
  "human"
];

export default function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % titles.length);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block min-w-[200px]"> {/* Adjust min-width based on your longest text */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={textChange}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="inline-block"
        >
          {titles[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
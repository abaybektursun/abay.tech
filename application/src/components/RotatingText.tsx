// src/components/RotatingText.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const titles = [
  "an AI consultant",
  "a fractional CTO",
  "an ML Engineer",
  "one with the universe",
  "loving awereness"
];

const textChange = {
  hidden: {
    y: 20,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // First make the current text disappear
      setIsVisible(false);
      
      // Wait for exit animation, then change text
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % titles.length);
        setIsVisible(true);
      }, 200);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block min-w-[200px]">
      <AnimatePresence mode="wait" initial={false}>
        {isVisible && (
          <motion.span
            key={currentIndex}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={textChange}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="inline-block"
          >
            {titles[currentIndex]}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
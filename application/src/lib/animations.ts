// src/lib/animations.ts
export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  softFadeUp: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  },
  gentleScale: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  }
};

// More refined transitions
export const transition = {
  duration: 0.4,
  ease: [0.23, 1, 0.32, 1] // Custom easing for smoother motion
};

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const textChange = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
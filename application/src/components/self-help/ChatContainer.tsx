'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useConversationStore } from '@/lib/self-help/stores/conversation-store';
import { type ReactNode } from 'react';

interface ChatContainerProps {
  children: ReactNode;
  visualizationPanel?: ReactNode;
}

export function ChatContainer({ children, visualizationPanel }: ChatContainerProps) {
  const showVisualization = useConversationStore((state) => state.showVisualization);

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Chat Panel - slides left when visualization appears */}
      <motion.div
        className="flex h-full flex-col"
        animate={{
          width: showVisualization ? '60%' : '100%',
        }}
        initial={{
          width: '100%',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      >
        {children}
      </motion.div>

      {/* Visualization Panel - slides in from right */}
      <AnimatePresence>
        {showVisualization && (
          <motion.div
            className="h-full border-l bg-background"
            initial={{
              width: 0,
              opacity: 0,
            }}
            animate={{
              width: '40%',
              opacity: 1,
            }}
            exit={{
              width: 0,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
          >
            <div className="h-full overflow-auto p-6">
              {visualizationPanel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

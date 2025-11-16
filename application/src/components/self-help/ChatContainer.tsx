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
    <div className="relative flex h-full w-full gap-4">
      {/* Chat Panel */}
      <motion.div
        className="flex flex-col"
        animate={{
          width: showVisualization ? '60%' : '100%',
        }}
        initial={{
          width: '100%',
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      >
        {children}
      </motion.div>

      {/* Visualization Panel */}
      <AnimatePresence>
        {showVisualization && (
          <motion.div
            className="rounded-xl border bg-background"
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
              stiffness: 400,
              damping: 30,
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
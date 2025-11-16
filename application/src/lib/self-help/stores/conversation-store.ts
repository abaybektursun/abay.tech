/**
 * Conversation Store
 *
 * Zustand store for managing self-help conversation state
 * with localStorage persistence for session data.
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConversationSession,
  ConversationType,
  VisualizationType,
} from '../types';

/**
 * Store state interface
 */
interface ConversationStore {
  // Layout state for visualization panel
  showVisualization: boolean;
  visualizationType: VisualizationType;
  visualizationData: unknown;

  // Session management
  currentSession: ConversationSession | null;
  sessions: ConversationSession[];

  // Actions
  toggleVisualization: (
    show: boolean,
    type?: VisualizationType,
    data?: unknown
  ) => void;
  startSession: (type: ConversationType) => void;
  updateSessionData: (data: unknown) => void;
  completeSession: () => void;
  clearSessions: () => void;
}

/**
 * Create the conversation store with persistence
 */
export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      showVisualization: false,
      visualizationType: null,
      visualizationData: null,
      currentSession: null,
      sessions: [],

      // Toggle visualization panel visibility
      toggleVisualization: (show, type, data) => {
        set({
          showVisualization: show,
          visualizationType: show ? (type || null) : null,
          visualizationData: show ? (data || null) : null,
        });
      },

      // Start a new conversation session
      startSession: (type) => {
        const session: ConversationSession = {
          id: crypto.randomUUID(),
          type,
          startedAt: new Date().toISOString(),
          data: {},
        };

        set({
          currentSession: session,
          showVisualization: false,
          visualizationType: null,
          visualizationData: null,
        });
      },

      // Update current session data
      updateSessionData: (data) => {
        const current = get().currentSession;
        if (current) {
          set({
            currentSession: {
              ...current,
              data: data as ConversationSession['data'],
            },
          });
        }
      },

      // Mark current session as complete and save it
      completeSession: () => {
        const current = get().currentSession;
        if (current) {
          const completed: ConversationSession = {
            ...current,
            completedAt: new Date().toISOString(),
          };

          set({
            sessions: [...get().sessions, completed],
            currentSession: null,
          });
        }
      },

      // Clear all saved sessions (for testing/debugging)
      clearSessions: () => {
        set({
          sessions: [],
          currentSession: null,
          showVisualization: false,
          visualizationType: null,
          visualizationData: null,
        });
      },
    }),
    {
      name: 'self-help-conversation-storage',
      // Only persist sessions, not UI state
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
      }),
    }
  )
);

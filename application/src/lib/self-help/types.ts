/**
 * Self-Help Application Types
 *
 * Core type definitions for the self-help chat application,
 * including needs assessment, conversation sessions, and visualizations.
 */

/**
 * Human needs categories based on psychological frameworks
 * (Maslow's hierarchy, self-determination theory, etc.)
 */
export type NeedCategory = 'physical' | 'emotional' | 'mental' | 'spiritual';

/**
 * Represents a single human need with fulfillment and importance metrics
 */
export interface Need {
  /** The broad category this need falls under */
  category: NeedCategory;

  /** Specific name of the need (e.g., "Connection", "Safety", "Growth") */
  name: string;

  /** How fulfilled this need is (0-100 scale) */
  fulfilled: number;

  /** How important this need is to the user (0-100 scale) */
  importance: number;
}

/**
 * Complete needs assessment data from a conversation
 */
export interface NeedsAssessment {
  /** Array of identified needs with metrics */
  needs: Need[];

  /** Key insights discovered during the assessment */
  insights: string[];

  /** When this assessment was completed */
  timestamp: string;

  /** Unique identifier for this assessment session */
  sessionId: string;
}

/**
 * Types of self-help conversations available
 */
export type ConversationType =
  | 'needs-assessment'
  | 'goal-setting'
  | 'daily-reflection';

/**
 * Represents a single conversation session
 */
export interface ConversationSession {
  /** Unique identifier for this session */
  id: string;

  /** Type of conversation */
  type: ConversationType;

  /** When the conversation started */
  startedAt: string;

  /** When the conversation completed (if finished) */
  completedAt?: string;

  /** Session-specific data (varies by conversation type) */
  data: NeedsAssessment | Record<string, unknown>;
}

/**
 * Types of visualizations that can be displayed
 */
export type VisualizationType = 'needs' | 'goals' | null;

/**
 * Tool call arguments for showing the needs chart
 */
export interface ShowNeedsChartArgs {
  needs: Array<{
    category: NeedCategory;
    name: string;
    fulfilled: number;
    importance: number;
  }>;
  insights: string[];
}

/**
 * Tool call arguments for hiding visualization
 */
export interface HideVisualizationArgs {
  // Empty object - no args needed
}

/**
 * Type Tests for Growth Tools Application
 *
 * These tests verify that TypeScript types are correctly defined
 * and can be used without compilation errors.
 */

import type {
  Need,
  NeedCategory,
  NeedsAssessment,
  ConversationSession,
  ConversationType,
  VisualizationType,
  ShowNeedsChartArgs,
} from '../../src/lib/growth-tools/types';

// Test: Need type can be instantiated with valid data
const validNeed: Need = {
  category: 'emotional',
  name: 'Connection',
  fulfilled: 60,
  importance: 85,
};

// Test: All need categories are valid
const validCategories: NeedCategory[] = [
  'physical',
  'emotional',
  'mental',
  'spiritual',
];

// Test: NeedsAssessment type can be instantiated
const validAssessment: NeedsAssessment = {
  needs: [validNeed],
  insights: ['Strong need for connection identified'],
  timestamp: new Date().toISOString(),
  sessionId: 'test-session-123',
};

// Test: ConversationSession with NeedsAssessment data
const validSession: ConversationSession = {
  id: 'session-123',
  type: 'needs-assessment',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  data: validAssessment,
};

// Test: All conversation types are valid
const validConversationTypes: ConversationType[] = [
  'needs-assessment',
  'goal-setting',
  'daily-reflection',
];

// Test: Visualization types
const validVisTypes: VisualizationType[] = [
  'needs',
  'goals',
  null,
];

// Test: ShowNeedsChartArgs can be constructed
const validChartArgs: ShowNeedsChartArgs = {
  needs: [
    {
      category: 'physical',
      name: 'Rest',
      fulfilled: 40,
      importance: 90,
    },
  ],
  insights: ['Sleep is important but lacking'],
};

// Export for verification
export const typeTests = {
  validNeed,
  validCategories,
  validAssessment,
  validSession,
  validConversationTypes,
  validVisTypes,
  validChartArgs,
};

console.log('✅ All type tests passed - types are correctly defined');

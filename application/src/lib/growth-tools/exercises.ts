/**
 * Exercise configuration for Growth Tools
 * Each exercise defines its prompts, RAG folder, tools, and UI suggestions
 */

export interface ExerciseSuggestion {
  icon: string; // Lucide icon name
  text: string;
  color: string;
}

export interface VoiceSettings {
  stability?: number; // 0-1, lower = more expressive
  similarity_boost?: number; // 0-1, how closely to match original voice
  style?: number; // 0-1, amplifies speaker's style (increases latency if >0)
}

export interface ExerciseConfig {
  name: string;
  description: string;
  prompt: string[]; // Array of prompt file paths (relative to prompts/ folder)
  ragFolder: string | null; // Folder name in public/rag/ or null if no RAG
  tools: string[]; // Tool names this exercise uses
  suggestions: ExerciseSuggestion[];
  voice: string; // ElevenLabs voice ID
  voiceSettings?: VoiceSettings; // Optional ElevenLabs voice settings
  introVideoId?: string; // YouTube video ID for intro context video
}

export const exercises: Record<string, ExerciseConfig> = {
  'needs-assessment': {
    name: 'Needs Assessment',
    description:
      "Utilize Tony Robbins' framework of the 6 human needs to evaluate where you are right now.",
    prompt: [
      'needs-assessment/prompt.md',
      'needs-assessment/human_needs_framework.md',
    ],
    ragFolder: null,
    tools: ['show_needs_chart', 'show_life_wheel', 'request_slider', 'hide_chart'],
    suggestions: [
      { icon: 'BarChart', text: 'Analyze my needs', color: '#76d0eb' },
      { icon: 'Box', text: 'Surprise me', color: '#76d0eb' },
      { icon: 'FileText', text: 'Life satisfaction check', color: '#ea8444' },
      { icon: 'Code2', text: 'Action plan', color: '#6c71ff' },
      { icon: 'Lightbulb', text: 'Get growth advice', color: '#76d0eb' },
    ],
    voice: 'WWr4C8ld745zI3BiA8n7', // Tony Robbins style voice
    introVideoId: 'HVwUfSiZUZM', // Tony Robbins - 6 Human Needs
  },
  'open-world-mode': {
    name: 'Open World Mode',
    description:
      'Develop high-agency thinking: treat life as a game with hackable rules.',
    prompt: ['open-world-mode/prompt.md'],
    ragFolder: 'scrappy_mindset',
    tools: [],
    suggestions: [
      { icon: 'Compass', text: 'I feel stuck', color: '#76d0eb' },
      { icon: 'Rocket', text: 'I want to start something', color: '#ea8444' },
      { icon: 'Zap', text: 'I have no resources', color: '#6c71ff' },
      { icon: 'Map', text: "I don't know what's possible", color: '#22c55e' },
      { icon: 'Sparkles', text: 'Surprise me', color: '#76d0eb' },
    ],
    voice: 'CyHwTRKhXEYuSd7CbMwI', // Aria - youthful and fun
    voiceSettings: {
      stability: 0.3, // Low stability for more expressive, dynamic speech
      similarity_boost: 0.8,
      style: 0.7, // High style for enthusiasm and energy
    }
  },
  'integrity-alignment': {
    name: 'Integrity Alignment',
    description:
      "Work through Martha Beck's Way of Integrity exercises to align your actions with your true nature.",
    prompt: ['integrity-alignment/prompt.md', 'integrity-alignment/workbook.md'],
    ragFolder: null,
    tools: [],
    suggestions: [
      { icon: 'Compass', text: 'Am I on the right path?', color: '#22c55e' },
      { icon: 'Heart', text: 'Something feels off', color: '#ea8444' },
      { icon: 'Eye', text: 'Help me see clearly', color: '#76d0eb' },
      { icon: 'Sparkles', text: 'Surprise me', color: '#6c71ff' },
    ],
    voice: '21m00Tcm4TlvDq8ikWAM', // Rachel - calm female, empathetic and soothing
    introVideoId: 'By4e6MsiADA', // Martha Beck - The Way of Integrity
  },
};

export function getExercise(id: string): ExerciseConfig | null {
  return exercises[id] ?? null;
}

export function getExerciseIds(): string[] {
  return Object.keys(exercises);
}

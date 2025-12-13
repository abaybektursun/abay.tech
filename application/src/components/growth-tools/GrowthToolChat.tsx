'use client';

/**
 * Unified chat component for Growth Tools exercises.
 * Uses exercise ID to load config and call the unified API.
 *
 * NOTE: This component uses custom SSE parsing instead of the `useChat` hook from @ai-sdk/react.
 * This is intentional due to a known limitation in AI SDK 5:
 *
 * Issue: useChat doesn't support UI Message Stream format (toUIMessageStreamResponse)
 * - Tool events (tool-input-available, tool-output-available) are not processed
 * - onFinish/onError callbacks don't fire with createUIMessageStream
 * - Custom data parts are ignored
 *
 * Track for resolution: https://github.com/vercel/ai/issues/8549
 * Related: https://github.com/vercel/ai/issues/8713
 *
 * Once #8549 is resolved, consider migrating to useChat for cleaner code.
 */

import { type UIMessage, type TextUIPart } from 'ai';
import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Container from '@/components/container';
import { getLocalChat, saveLocalChat, getLocalChats, clearLocalChats } from '@/lib/growth-tools/local-storage';
import { getChat, getChats, migrateChats } from '@/lib/actions';
import '@/styles/ai-chat.css';

// AI Elements components
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import { Loader } from '@/components/ai-elements/loader';
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';

// Icons - import all that might be used in suggestions
import * as LucideIcons from 'lucide-react';
import {
  FileText as FileIcon,
  Paperclip as PaperclipIcon,
  Camera as CameraIcon,
  Image as ImageIcon,
  ScreenShare as ScreenShareIcon,
  Copy as CopyIcon,
  Mic as MicIcon,
  Volume2 as Volume2Icon,
  Square as SquareIcon,
} from 'lucide-react';

// UI components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactContent,
} from '@/components/ai-elements/artifact';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Bot, User, BarChart2, ExternalLink } from 'lucide-react';

// Exercise config
import { getExercise, type ExerciseSuggestion } from '@/lib/growth-tools/exercises';

// Visualizations
import { NeedsChart } from '@/components/growth-tools/visualizations/NeedsChart';
import { LifeWheel } from '@/components/growth-tools/visualizations/LifeWheel';
import type { ShowNeedsChartArgs, ShowLifeWheelArgs, RequestSliderArgs, SliderField } from '@/lib/growth-tools/types';

export interface GrowthToolChatProps {
  exercise: string;
  id?: string;
  initialMessages?: UIMessage[];
}

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';
type VoiceInputState = 'idle' | 'recording' | 'transcribing';
type AudioOutputState = 'idle' | 'generating' | 'playing';

// Shared endpoints
const CHAT_ENDPOINT = '/api/apps/growth-tools/chat';
const TRANSCRIBE_ENDPOINT = '/api/apps/growth-tools/transcribe';
const SPEAK_ENDPOINT = '/api/apps/growth-tools/speak';

/**
 * Get Lucide icon component by name
 */
function getIcon(name: string): React.ComponentType<{ size?: number; style?: React.CSSProperties }> | null {
  const icon = (LucideIcons as any)[name];
  return icon ?? null;
}

export function GrowthToolChat({
  exercise,
  id: propId,
  initialMessages,
}: GrowthToolChatProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [chatId] = useState(() => propId ?? nanoid());
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages ?? []);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const migrationDone = useRef(false);
  const handledToolCalls = useRef<Set<string>>(new Set());
  const [voiceInputState, setVoiceInputState] = useState<VoiceInputState>('idle');
  const [audioOutputState, setAudioOutputState] = useState<AudioOutputState>('idle');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tool UI state
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<ShowNeedsChartArgs | null>(null);
  const [showLifeWheel, setShowLifeWheel] = useState(false);
  const [lifeWheelData, setLifeWheelData] = useState<ShowLifeWheelArgs | null>(null);
  const [sliderValues, setSliderValues] = useState<Record<string, Record<string, number>>>({});

  // Intro video state (sessionStorage - resets on hard refresh)
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  // Get exercise config
  const exerciseConfig = getExercise(exercise);
  const suggestions: ExerciseSuggestion[] = exerciseConfig?.suggestions ?? [];

  const isLoading = status === 'streaming' || status === 'submitted';
  const isAuthenticated = sessionStatus === 'authenticated' && session?.user;

  // Tool handled callback
  const handleToolHandled = useCallback((toolCallId: string) => {
    handledToolCalls.current.add(toolCallId);
  }, []);

  // Show intro video on first visit (uses sessionStorage - resets on hard refresh)
  useEffect(() => {
    if (!exerciseConfig?.introVideoId) return;

    const key = `growth-tools-intro-seen-${exercise}`;
    const seen = sessionStorage.getItem(key);

    if (!seen) {
      setShowIntroVideo(true);
    }
  }, [exercise, exerciseConfig?.introVideoId]);

  const handleCloseIntroVideo = useCallback(() => {
    const key = `growth-tools-intro-seen-${exercise}`;
    sessionStorage.setItem(key, 'true');
    setShowIntroVideo(false);
  }, [exercise]);

  // Load existing chat on mount
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (initialMessages && initialMessages.length > 0) return;

    const loadChat = async () => {
      if (isAuthenticated && session?.user?.email) {
        const dbChat = await getChat(chatId, session.user.email);
        if (dbChat?.messages) {
          setMessages(JSON.parse(dbChat.messages as string));
        }
      } else {
        const localChat = getLocalChat(chatId);
        if (localChat && localChat.messages.length > 0) {
          setMessages(localChat.messages);
        }
      }
    };

    loadChat();
  }, [chatId, sessionStatus, isAuthenticated, session?.user?.email, initialMessages]);

  // Migration: When user logs in, migrate localStorage chats to DB
  useEffect(() => {
    if (migrationDone.current) return;
    if (sessionStatus !== 'authenticated' || !session?.user?.email) return;

    const runMigration = async () => {
      migrationDone.current = true;
      const userId = session.user!.email!;

      const dbChats = await getChats(userId);
      if (dbChats.length > 0) {
        clearLocalChats();
        return;
      }

      const localChats = getLocalChats();
      if (localChats.length > 0) {
        await migrateChats(localChats, userId);
        clearLocalChats();
      }
    };

    runMigration();
  }, [session, sessionStatus]);

  // Save to localStorage for anonymous users when messages change
  useEffect(() => {
    if (isAuthenticated) return;
    if (messages.length === 0) return;

    const firstTextPart = messages[0]?.parts.find(p => p.type === 'text') as TextUIPart | undefined;
    const title = firstTextPart?.text?.substring(0, 100) ?? 'New Chat';

    saveLocalChat({
      id: chatId,
      title,
      createdAt: Date.now(),
      messages,
    });
  }, [messages, chatId, isAuthenticated]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    const userMessage: UIMessage = {
      id: nanoid(),
      role: 'user',
      parts: [{ type: 'text', text: userText }],
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setStatus('submitted');
    setError(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const body = {
      exercise, // Include exercise ID
      id: chatId,
      messages: newMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        parts: msg.parts,
      })),
    };

    let response: Response;
    try {
      response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      throw err;
    }

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json();
        const errorMessage = data.error || 'Usage limit reached. Please try again later.';
        toast.error('Usage Limit Reached', {
          description: errorMessage,
          duration: 5000,
        });
        setMessages(prev => [...prev, {
          id: nanoid(),
          role: 'assistant',
          parts: [{ type: 'text', text: `⚠️ ${errorMessage}` }],
        }]);
        setStatus('ready');
        return;
      }
      const errorText = await response.text();
      console.error('[Chat] API error:', errorText);
      setError(new Error(errorText));
      setStatus('error');
      return;
    }

    if (!response.body) {
      console.error('[Chat] No response body');
      setError(new Error('No response body'));
      setStatus('error');
      return;
    }

    setStatus('streaming');

    const assistantMessageId = nanoid();
    let currentText = '';

    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      parts: [],
    }]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6);
        if (data === '[DONE]') continue;

        const chunk = JSON.parse(data);

        if (chunk.type === 'text-delta') {
          currentText += chunk.delta;
        }

        if (chunk.type === 'tool-input-available') {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              const currentParts = updated[lastIndex].parts as any[];

              const otherParts = currentParts.filter(
                (p: any) => p.toolCallId !== chunk.toolCallId
              );

              const isDuplicateContent = otherParts.some(
                (p: any) =>
                  p.type === `tool-${chunk.toolName}` &&
                  JSON.stringify(p.input) === JSON.stringify(chunk.input)
              );

              if (isDuplicateContent) {
                return updated;
              }

              updated[lastIndex] = {
                id: assistantMessageId,
                role: 'assistant',
                parts: [
                  ...otherParts,
                  {
                    type: `tool-${chunk.toolName}`,
                    toolCallId: chunk.toolCallId,
                    state: 'input-available',
                    input: chunk.input,
                  },
                ] as any,
              };
            }
            return updated;
          });
        }

        if (chunk.type === 'tool-output-available') {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              // Find the tool part to get tool name and input for artifact saving
              const toolPart = (updated[lastIndex].parts as any[]).find(
                (p: any) => p.toolCallId === chunk.toolCallId
              );

              // Save artifact for chart tools (only for authenticated users, dedupe by toolCallId)
              if (toolPart && isAuthenticated && !handledToolCalls.current.has(chunk.toolCallId)) {
                const toolName = toolPart.type.replace('tool-', '');
                if (toolName === 'show_needs_chart') {
                  handledToolCalls.current.add(chunk.toolCallId);
                  fetch('/api/apps/growth-tools/artifacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chatId,
                      exerciseId: exercise,
                      type: 'needs-chart',
                      title: 'Needs Assessment',
                      data: toolPart.input,
                    }),
                  }).catch(console.error);
                }
                if (toolName === 'show_life_wheel') {
                  handledToolCalls.current.add(chunk.toolCallId);
                  fetch('/api/apps/growth-tools/artifacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chatId,
                      exerciseId: exercise,
                      type: 'life-wheel',
                      title: '6 Human Needs Assessment',
                      data: toolPart.input,
                    }),
                  }).catch(console.error);
                }
              }

              updated[lastIndex] = {
                ...updated[lastIndex],
                parts: (updated[lastIndex].parts as any[]).map((p: any) =>
                  p.toolCallId === chunk.toolCallId
                    ? { ...p, state: 'output-available', output: chunk.output }
                    : p
                ) as any,
              };
            }
            return updated;
          });
        }

        if (chunk.type === 'text-delta') {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              const nonTextParts = updated[lastIndex].parts.filter(
                (p: { type: string }) => p.type !== 'text'
              );
              updated[lastIndex] = {
                id: assistantMessageId,
                role: 'assistant',
                parts: [{ type: 'text' as const, text: currentText }, ...nonTextParts],
              };
            }
            return updated;
          });
        }
      }
    }

    // Server-side persistence now handles authenticated users via onFinish callback
    // This fixes the bug where tool parts were lost (only text was saved)
    // See: src/app/api/apps/growth-tools/chat/route.ts
    console.log('[GrowthToolChat] Stream complete - server handles persistence for authenticated users');

    setStatus('ready');
  }, [messages, chatId, isAuthenticated, session?.user?.email, exercise]);

  const handleSubmit = useCallback((message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;
    sendMessage(message.text || 'Sent with attachments');
    setText('');
  }, [sendMessage]);

  const handleFileAction = useCallback((action: string) => {
    toast.success('File action', {
      description: action,
    });
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  // Stop any playing audio
  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingMessageId(null);
    setAudioOutputState('idle');
  }, []);

  // Voice recording - start
  const startRecording = useCallback(async () => {
    stopAudioPlayback();
    setVoiceInputState('recording');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());

      if (audioChunksRef.current.length === 0) {
        setVoiceInputState('idle');
        return;
      }

      setVoiceInputState('transcribing');

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(TRANSCRIBE_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 429) {
        const data = await response.json();
        toast.error('Usage Limit Reached', {
          description: data.error || 'Please try again later.',
          duration: 5000,
        });
        setVoiceInputState('idle');
        return;
      }

      const { text, error } = await response.json();

      if (error) {
        toast.error('Transcription failed');
        setVoiceInputState('idle');
        return;
      }

      if (text?.trim()) {
        setVoiceInputState('idle');
        sendMessage(text);
      } else {
        setVoiceInputState('idle');
      }
    };

    mediaRecorder.start();
  }, [sendMessage, stopAudioPlayback]);

  // Voice recording - stop
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // TTS playback
  const playMessage = useCallback(async (messageId: string, messageText: string) => {
    if (playingMessageId === messageId) {
      stopAudioPlayback();
      return;
    }

    setPlayingMessageId(messageId);
    setAudioOutputState('generating');

    const response = await fetch(SPEAK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: messageText,
        voice: exerciseConfig?.voice,
        voiceSettings: exerciseConfig?.voiceSettings,
      }),
    });

    if (response.status === 429) {
      const data = await response.json();
      toast.error('Usage Limit Reached', {
        description: data.error || 'Please try again later.',
        duration: 5000,
      });
      setPlayingMessageId(null);
      setAudioOutputState('idle');
      return;
    }

    if (!response.ok) {
      toast.error('Failed to generate audio');
      setPlayingMessageId(null);
      setAudioOutputState('idle');
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    setAudioOutputState('playing');
    audioRef.current.src = audioUrl;
    audioRef.current.onended = () => {
      setPlayingMessageId(null);
      setAudioOutputState('idle');
      URL.revokeObjectURL(audioUrl);
    };
    audioRef.current.play();
  }, [playingMessageId, stopAudioPlayback, exerciseConfig?.voice]);

  // Auto-play TTS when AI response completes
  const prevStatusRef = useRef<ChatStatus>('ready');
  useEffect(() => {
    if (prevStatusRef.current === 'streaming' && status === 'ready') {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        const textPart = lastMessage.parts.find((p): p is TextUIPart => p.type === 'text');
        if (textPart?.text) {
          setTimeout(() => {
            playMessage(lastMessage.id, textPart.text);
          }, 100);
        }
      }
    }
    prevStatusRef.current = status;
  }, [status, messages, playMessage]);

  // Built-in tool renderers
  const renderToolPart = (part: any) => {
    const toolName = part.type.replace('tool-', '');
    const { toolCallId, state, input } = part;

    // show_needs_chart tool
    if (toolName === 'show_needs_chart') {
      const isComplete = state === 'output-available';
      const chartData = input as ShowNeedsChartArgs;

      if (isComplete) {
        return (
          <div className="mt-3 max-w-sm">
            <Artifact
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => {
                setVisualizationData(chartData);
                setShowVisualization(true);
              }}
            >
              <ArtifactHeader className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <ArtifactTitle>Needs Assessment</ArtifactTitle>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </ArtifactHeader>
              <ArtifactContent className="py-2 px-3">
                <ArtifactDescription>
                  {chartData.needs.length} needs analyzed • Click to view
                </ArtifactDescription>
              </ArtifactContent>
            </Artifact>
          </div>
        );
      }

      return (
        <div className="mt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">
            <Loader size={12} />
            <Shimmer>Generating visualization...</Shimmer>
          </div>
        </div>
      );
    }

    // show_life_wheel tool
    if (toolName === 'show_life_wheel') {
      const isComplete = state === 'output-available';
      const wheelData = input as ShowLifeWheelArgs;

      if (isComplete) {
        return (
          <div className="mt-3 max-w-sm">
            <Artifact
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => {
                setLifeWheelData(wheelData);
                setShowLifeWheel(true);
              }}
            >
              <ArtifactHeader className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <ArtifactTitle>6 Human Needs</ArtifactTitle>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </ArtifactHeader>
              <ArtifactContent className="py-2 px-3">
                <ArtifactDescription>
                  {wheelData.areas.length} needs assessed • Click to view
                </ArtifactDescription>
              </ArtifactContent>
            </Artifact>
          </div>
        );
      }

      return (
        <div className="mt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">
            <Loader size={12} />
            <Shimmer>Generating life wheel...</Shimmer>
          </div>
        </div>
      );
    }

    // hide_chart tool
    if (toolName === 'hide_chart') {
      if (state === 'output-available' && !handledToolCalls.current.has(toolCallId)) {
        handledToolCalls.current.add(toolCallId);
        handleToolHandled(toolCallId);
        setShowVisualization(false);
      }
      return null;
    }

    // request_slider tool
    if (toolName === 'request_slider') {
      const isComplete = state === 'output-available';
      const sliderData = input as RequestSliderArgs;
      const isSubmitted = handledToolCalls.current.has(toolCallId);
      const toolValues = sliderValues[toolCallId] ?? {};

      const handleSliderSubmit = (fields: SliderField[], values: Record<string, number>) => {
        handledToolCalls.current.add(toolCallId);
        handleToolHandled(toolCallId);
        const response = fields.map(f => `${f.name}: ${values[f.name] ?? f.defaultValue ?? 50}`).join(', ');
        sendMessage(response);
      };

      if (isComplete) {
        return (
          <div className="mt-3 w-full max-w-md">
            <Artifact>
              <ArtifactContent className="p-4 space-y-4">
                <p className="text-sm font-medium">{sliderData.question}</p>
                <div className="space-y-4">
                  {sliderData.fields.map((field) => {
                    const min = field.min ?? 0;
                    const max = field.max ?? 100;
                    const step = field.step ?? 1;
                    const currentValue = toolValues[field.name] ?? field.defaultValue ?? Math.round((min + max) / 2);

                    return (
                      <div key={field.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{field.name}</span>
                          <span className="text-sm font-medium">{currentValue}</span>
                        </div>
                        <Slider
                          className="cursor-pointer"
                          value={[currentValue]}
                          min={min}
                          max={max}
                          step={step}
                          disabled={isSubmitted || isLoading}
                          onValueChange={([value]) => {
                            setSliderValues(prev => ({
                              ...prev,
                              [toolCallId]: {
                                ...prev[toolCallId],
                                [field.name]: value,
                              },
                            }));
                          }}
                        />
                        {field.labels && (
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{field.labels[0]}</span>
                            <span>{field.labels[1]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!isSubmitted && (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => handleSliderSubmit(sliderData.fields, toolValues)}
                  >
                    Submit
                  </Button>
                )}
                {isSubmitted && (
                  <p className="text-xs text-muted-foreground text-center">Submitted</p>
                )}
              </ArtifactContent>
            </Artifact>
          </div>
        );
      }

      return (
        <div className="mt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">
            <Loader size={12} />
            <Shimmer>Preparing question...</Shimmer>
          </div>
        </div>
      );
    }

    // Unknown tools - don't render
    return null;
  };

  return (
    <div className="h-full">
      <Container className="flex h-full justify-center pt-4">
        <motion.div
          className="w-full h-[600px] bg-background rounded-lg border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="relative flex size-full flex-col divide-y overflow-hidden">
            <Conversation>
              <ConversationContent>
                {messages.map((message) => {
                  const textContent = message.parts
                    .filter((p): p is TextUIPart => p.type === 'text')
                    .map(p => p.text)
                    .join('\n');
                  const isUser = message.role === 'user';

                  return (
                    <div key={message.id} className={cn('flex items-start gap-2 md:gap-3', isUser && 'flex-row-reverse')}>
                      <Avatar className="h-8 w-8 shrink-0">
                        {isUser ? (
                          <>
                            <AvatarImage src={session?.user?.image ?? undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-muted">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Message from={isUser ? 'user' : 'assistant'}>
                        <div>
                          {message.parts.map((part, index) => {
                            if (part.type === 'text') {
                              return (
                                <MessageContent
                                  key={index}
                                  className={cn(
                                    'group-[.is-user]:rounded-[24px] group-[.is-user]:bg-secondary group-[.is-user]:text-foreground',
                                    'group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground'
                                  )}
                                >
                                  <MessageResponse>{(part as TextUIPart).text}</MessageResponse>
                                </MessageContent>
                              );
                            }
                            if (part.type.startsWith('tool-')) {
                              return <div key={index}>{renderToolPart(part)}</div>;
                            }
                            return null;
                          })}
                        </div>
                        {message.role === 'assistant' && textContent && (
                          <MessageActions className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageAction
                              tooltip={playingMessageId === message.id ? 'Stop' : 'Listen'}
                              onClick={() => playMessage(message.id, textContent)}
                            >
                              {playingMessageId === message.id ? (
                                <SquareIcon className="h-3.5 w-3.5" />
                              ) : (
                                <Volume2Icon className="h-3.5 w-3.5" />
                              )}
                            </MessageAction>
                            <MessageAction
                              tooltip="Copy"
                              onClick={() => {
                                navigator.clipboard.writeText(textContent);
                                toast.success('Copied to clipboard');
                              }}
                            >
                              <CopyIcon className="h-3.5 w-3.5" />
                            </MessageAction>
                          </MessageActions>
                        )}
                      </Message>
                    </div>
                  );
                })}

                {/* Loading state */}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex items-start gap-2 md:gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-muted">
                        <Loader size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <Message from="assistant">
                      <Shimmer className="text-sm text-muted-foreground">Thinking...</Shimmer>
                    </Message>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <Alert variant="destructive" className="mx-4">
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="grid shrink-0 gap-4 p-4">
              <PromptInput
                className="divide-y-0 rounded-[28px]"
                onSubmit={handleSubmit}
              >
                <PromptInputTextarea
                  className="px-5 md:text-base"
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Ask anything"
                  value={text}
                />
                <PromptInputFooter className="p-2.5">
                  <PromptInputTools>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <PromptInputButton
                          className="!rounded-full border font-medium"
                          variant="outline"
                        >
                          <PaperclipIcon size={16} />
                          <span>Attach</span>
                        </PromptInputButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleFileAction('upload-file')}>
                          <FileIcon className="mr-2" size={16} />
                          Upload file
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFileAction('upload-photo')}>
                          <ImageIcon className="mr-2" size={16} />
                          Upload photo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFileAction('take-screenshot')}>
                          <ScreenShareIcon className="mr-2" size={16} />
                          Take screenshot
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFileAction('take-photo')}>
                          <CameraIcon className="mr-2" size={16} />
                          Take photo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Mic button - always available */}
                    <PromptInputButton
                      className={cn(
                        '!rounded-full border font-medium transition-all min-w-[140px]',
                        voiceInputState === 'recording' && 'bg-red-500 text-white border-red-500 animate-pulse',
                        voiceInputState === 'transcribing' && 'bg-amber-500 text-white border-amber-500'
                      )}
                      variant="outline"
                      onMouseDown={voiceInputState === 'idle' ? startRecording : undefined}
                      onMouseUp={voiceInputState === 'recording' ? stopRecording : undefined}
                      onMouseLeave={voiceInputState === 'recording' ? stopRecording : undefined}
                      onTouchStart={voiceInputState === 'idle' ? startRecording : undefined}
                      onTouchEnd={voiceInputState === 'recording' ? stopRecording : undefined}
                      disabled={voiceInputState === 'transcribing'}
                    >
                      {voiceInputState === 'transcribing' ? (
                        <Loader size={16} />
                      ) : (
                        <MicIcon size={16} />
                      )}
                      <span>
                        {voiceInputState === 'idle' && 'Hold to speak'}
                        {voiceInputState === 'recording' && 'Recording...'}
                        {voiceInputState === 'transcribing' && 'Transcribing...'}
                      </span>
                    </PromptInputButton>
                    {/* Audio output indicator */}
                    {audioOutputState !== 'idle' && (
                      <PromptInputButton
                        className={cn(
                          '!rounded-full border font-medium transition-all',
                          audioOutputState === 'generating' && 'bg-blue-500 text-white border-blue-500',
                          audioOutputState === 'playing' && 'bg-green-500 text-white border-green-500 animate-pulse'
                        )}
                        variant="outline"
                        onClick={audioOutputState === 'playing' ? stopAudioPlayback : undefined}
                      >
                        {audioOutputState === 'generating' && (
                          <>
                            <Loader size={16} />
                            <span>Generating...</span>
                          </>
                        )}
                        {audioOutputState === 'playing' && (
                          <>
                            <Volume2Icon size={16} />
                            <span>Playing</span>
                            <SquareIcon size={12} />
                          </>
                        )}
                      </PromptInputButton>
                    )}
                  </PromptInputTools>
                </PromptInputFooter>
              </PromptInput>

              {messages.length === 0 && suggestions.length > 0 && (
                <Suggestions className="px-4">
                  {suggestions.map(({ icon, text, color }) => {
                    const Icon = getIcon(icon);
                    return (
                      <Suggestion
                        className="font-normal"
                        key={text}
                        onClick={() => handleSuggestionClick(text)}
                        suggestion={text}
                      >
                        {Icon && <Icon size={16} style={{ color }} />}
                        {text}
                      </Suggestion>
                    );
                  })}
                </Suggestions>
              )}
            </div>

            {/* Visualization overlay - NeedsChart */}
            {showVisualization && visualizationData && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                onClick={() => setShowVisualization(false)}
              >
                <div
                  className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <NeedsChart
                    data={visualizationData}
                    onClose={() => setShowVisualization(false)}
                  />
                </div>
              </div>
            )}

            {/* Visualization overlay - LifeWheel */}
            {showLifeWheel && lifeWheelData && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                onClick={() => setShowLifeWheel(false)}
              >
                <div
                  className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LifeWheel
                    data={lifeWheelData}
                    onClose={() => setShowLifeWheel(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </Container>

      {/* Intro video dialog */}
      {exerciseConfig?.introVideoId && (
        <Dialog open={showIntroVideo} onOpenChange={(open) => !open && handleCloseIntroVideo()}>
          <DialogContent className="max-w-4xl">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle>Before You Begin</DialogTitle>
              <DialogDescription>
                Watch this video to understand the framework behind this exercise
              </DialogDescription>
            </DialogHeader>

            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${exerciseConfig.introVideoId}?autoplay=1&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <DialogFooter className="sm:justify-center">
              <Button onClick={handleCloseIntroVideo} size="lg" variant="secondary">
                Start Exercise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

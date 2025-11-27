'use client';

/**
 * AI SDK v5 Chat Implementation - Key Lessons Learned:
 *
 * 1. useChat hook from @ai-sdk/react has known issues in v5 where messages
 *    don't update and status stays "ready" (GitHub issues #8247, #8549)
 *
 * 2. The API (streamText + toUIMessageStreamResponse) works correctly -
 *    verified via curl. The issue is client-side stream consumption.
 *
 * 3. Solution: Manual SSE parsing instead of useChat. Parse the stream
 *    directly from fetch response.body using ReadableStream API.
 *
 * 4. Stream format from toUIMessageStreamResponse():
 *    - data: {"type":"text-delta","delta":"Hello"} - text chunks
 *    - data: {"type":"start"} / {"type":"finish"} - lifecycle events
 *    - data: [DONE] - stream end marker
 */

import { type UIMessage, type TextUIPart } from 'ai';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Container from '@/components/container';
import { NeedsChart } from '@/components/growth-tools/visualizations/NeedsChart';
import type { ShowNeedsChartArgs, RequestSliderArgs, SliderField } from '@/lib/growth-tools/types';
import { getLocalChat, saveLocalChat, getLocalChats, clearLocalChats } from '@/lib/growth-tools/local-storage';
import { getChat, getChats, migrateChats, saveChat } from '@/lib/actions';
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
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactContent,
} from '@/components/ai-elements/artifact';
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';

// Icons
import {
  BarChart as BarChartIcon,
  Box as BoxIcon,
  FileText as FileIcon,
  Lightbulb as LightbulbIcon,
  Paperclip as PaperclipIcon,
  Code2 as CodeIcon,
  Camera as CameraIcon,
  Image as ImageIcon,
  ScreenShare as ScreenShareIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
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
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Bot, User, BarChart2, ExternalLink } from 'lucide-react';

const suggestions = [
  {
    icon: BarChartIcon,
    text: "Analyze my needs",
    color: "#76d0eb",
  },
  {
    icon: BoxIcon,
    text: "Surprise me",
    color: "#76d0eb",
  },
  {
    icon: FileIcon,
    text: "Life satisfaction check",
    color: "#ea8444",
  },
  {
    icon: CodeIcon,
    text: "Action plan",
    color: "#6c71ff",
  },
  {
    icon: LightbulbIcon,
    text: "Get growth advice",
    color: "#76d0eb",
  },
];

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

// Voice INPUT state (mic button) - separate from audio output
type VoiceInputState = 'idle' | 'recording' | 'transcribing';

// Audio OUTPUT state (TTS playback) - independent from voice input
type AudioOutputState = 'idle' | 'generating' | 'playing';

export function NeedsAssessmentView({
  id: propId,
  initialMessages,
}: {
  id?: string;
  initialMessages?: UIMessage[];
}) {
  const { data: session, status: sessionStatus } = useSession();
  const [chatId] = useState(() => propId ?? nanoid());
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<ShowNeedsChartArgs | null>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages ?? []);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const migrationDone = useRef(false);
  const handledToolCalls = useRef<Set<string>>(new Set());
  const [sliderValues, setSliderValues] = useState<Record<string, Record<string, number>>>({});
  const [voiceInputState, setVoiceInputState] = useState<VoiceInputState>('idle');
  const [audioOutputState, setAudioOutputState] = useState<AudioOutputState>('idle');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isLoading = status === 'streaming' || status === 'submitted';
  const isAuthenticated = sessionStatus === 'authenticated' && session?.user;

  // Load existing chat on mount
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (initialMessages && initialMessages.length > 0) return; // Already have messages

    const loadChat = async () => {
      if (isAuthenticated && session?.user?.email) {
        // Load from DB for authenticated users
        const dbChat = await getChat(chatId, session.user.email);
        if (dbChat?.messages) {
          setMessages(JSON.parse(dbChat.messages as string));
        }
      } else {
        // Load from localStorage for anonymous users
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

      // Check if user already has chats in DB
      const dbChats = await getChats(userId);
      if (dbChats.length > 0) {
        // User has existing chats - discard localStorage
        clearLocalChats();
        return;
      }

      // User is new - migrate localStorage chats
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
    if (isAuthenticated) return; // Skip for logged-in users
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

    // Create user message
    const userMessage: UIMessage = {
      id: nanoid(),
      role: 'user',
      parts: [{ type: 'text', text: userText }],
    };

    // Add user message immediately
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setStatus('submitted');
    setError(null);

    // Abort any ongoing request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Prepare the request body
    const body = {
      id: chatId,
      messages: newMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        parts: msg.parts,
      })),
      trigger: 'submit-message',
    };

    let response: Response;
    try {
      response = await fetch('/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }
      throw err;
    }

    if (!response.ok) {
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


    // Create assistant message placeholder
    const assistantMessageId = nanoid();
    let currentText = '';

    // Add placeholder assistant message
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      parts: [],
    }]);

    // Manual SSE parsing - bypasses buggy useChat hook in AI SDK v5
    // Stream format from toUIMessageStreamResponse():
    //   - text-delta: { type: "text-delta", delta: "..." }
    //   - tool-input-available: { type: "tool-input-available", toolCallId, toolName, input }
    //   - tool-output-available: { type: "tool-output-available", toolCallId, output } (no toolName!)
    // Note: tool-output-available lacks toolName, so we track it from tool-input-available
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6);
        if (data === '[DONE]') continue;

        const chunk = JSON.parse(data);

        // Handle text-delta chunks for streaming text
        if (chunk.type === 'text-delta') {
          currentText += chunk.delta;
        }

        // Handle tool input available - part type must be `tool-${toolName}` (e.g., "tool-show_needs_chart")
        if (chunk.type === 'tool-input-available') {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              const currentParts = updated[lastIndex].parts as any[];

              // 1. Remove any existing part with the SAME toolCallId (update case)
              const otherParts = currentParts.filter(
                (p: any) => p.toolCallId !== chunk.toolCallId
              );

              // 2. Check for duplicate CONTENT (different toolCallId but same input)
              // This prevents the AI from "stuttering" and sending the same tool call multiple times
              const isDuplicateContent = otherParts.some(
                (p: any) =>
                  p.type === `tool-${chunk.toolName}` &&
                  JSON.stringify(p.input) === JSON.stringify(chunk.input)
              );

              if (isDuplicateContent) {
                return updated; // Skip adding this duplicate
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

        // Handle tool output (when tool execution completes)
        if (chunk.type === 'tool-output-available') {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
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

        // Update message with current text (only if text changed)
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

    // Build final messages array for saving
    const finalMessages: UIMessage[] = [
      ...newMessages,
      {
        id: assistantMessageId,
        role: 'assistant',
        parts: [{ type: 'text', text: currentText }],
      },
    ];

    // Save to DB for authenticated users
    if (isAuthenticated && session?.user?.email) {
      saveChat({
        id: chatId,
        messages: finalMessages,
        userId: session.user.email,
      });
    }

    setStatus('ready');
  }, [messages, chatId, isAuthenticated, session?.user?.email]);

  // Handle hide_chart tool - closes the visualization modal
  useEffect(() => {
    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type === 'tool-hide_chart') {
          const toolPart = part as { toolCallId?: string; state?: string };
          if (toolPart.state === 'output-available' && toolPart.toolCallId && !handledToolCalls.current.has(toolPart.toolCallId)) {
            handledToolCalls.current.add(toolPart.toolCallId);
            setShowVisualization(false);
          }
        }
      }
    }
  }, [messages]);

  // Open chart from Artifact click
  const handleOpenChart = useCallback((data: ShowNeedsChartArgs) => {
    setVisualizationData(data);
    setShowVisualization(true);
  }, []);

  // Handle slider submission - sends values back via sendMessage (official AI SDK pattern)
  const handleSliderSubmit = useCallback((toolCallId: string, fields: SliderField[], values: Record<string, number>) => {
    // Mark this tool call as handled to prevent re-submission
    handledToolCalls.current.add(toolCallId);
    // Format values as readable response
    const response = fields.map(f => `${f.name}: ${values[f.name] ?? f.defaultValue ?? 50}`).join(', ');
    sendMessage(response);
  }, [sendMessage]);

  const handleSubmit = useCallback((message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;
    sendMessage(message.text || "Sent with attachments");
    setText("");
  }, [sendMessage]);

  const handleFileAction = useCallback((action: string) => {
    toast.success("File action", {
      description: action,
    });
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  // Stop any playing audio (used when starting recording)
  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingMessageId(null);
    setAudioOutputState('idle');
  }, []);

  // Voice recording - start on mouse down
  const startRecording = useCallback(async () => {
    // Interrupt any playing audio when user starts recording
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

      // Transition to transcribing state
      setVoiceInputState('transcribing');

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/apps/growth-tools/needs-assessment/transcribe', {
        method: 'POST',
        body: formData,
      });

      const { text, error } = await response.json();

      if (error) {
        toast.error('Transcription failed');
        setVoiceInputState('idle');
        return;
      }

      if (text?.trim()) {
        // Back to idle before sending - sendMessage will handle chat state
        setVoiceInputState('idle');
        sendMessage(text);
      } else {
        setVoiceInputState('idle');
      }
    };

    mediaRecorder.start();
  }, [sendMessage, stopAudioPlayback]);

  // Voice recording - stop on mouse up
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Don't set to idle here - let onstop handler manage state transition
  }, []);

  // TTS playback
  const playMessage = useCallback(async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      // Stop current playback
      stopAudioPlayback();
      return;
    }

    setPlayingMessageId(messageId);
    setAudioOutputState('generating');

    const response = await fetch('/api/apps/growth-tools/needs-assessment/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

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
  }, [playingMessageId, stopAudioPlayback]);

  // Auto-play TTS when AI response completes (always)
  const prevStatusRef = useRef<ChatStatus>('ready');
  useEffect(() => {
    // Trigger when transitioning from streaming to ready
    if (prevStatusRef.current === 'streaming' && status === 'ready') {
      // Find the last assistant message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        const textPart = lastMessage.parts.find((p): p is TextUIPart => p.type === 'text');
        if (textPart?.text) {
          // Small delay to ensure UI is updated
          setTimeout(() => {
            playMessage(lastMessage.id, textPart.text);
          }, 100);
        }
      }
    }
    prevStatusRef.current = status;
  }, [status, messages, playMessage]);

  return (
    <div className="h-full">
      <Container className="flex h-full justify-center pt-4">
        {/* Chat container matching ChatGPT demo structure */}
        <motion.div
          className="w-full h-[600px] bg-background rounded-lg border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
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
                    <div key={message.id} className={cn("flex items-start gap-2 md:gap-3", isUser && "flex-row-reverse")}>
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
                                  "group-[.is-user]:rounded-[24px] group-[.is-user]:bg-secondary group-[.is-user]:text-foreground",
                                  "group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground"
                                )}
                              >
                                <MessageResponse>{(part as TextUIPart).text}</MessageResponse>
                              </MessageContent>
                            );
                          }
                          if (part.type.startsWith('tool-')) {
                            const toolPart = part as { type: string; toolCallId: string; state?: string; input?: unknown };
                            const toolName = part.type.replace('tool-', '');
                            const isComplete = toolPart.state === 'output-available';

                            // Render clickable Artifact card for completed chart
                            if (toolName === 'show_needs_chart' && isComplete) {
                              const chartData = toolPart.input as ShowNeedsChartArgs;
                              return (
                                <div key={toolPart.toolCallId} className="mt-3 max-w-sm">
                                  <Artifact
                                    className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                                    onClick={() => handleOpenChart(chartData)}
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

                            // Loading state for in-progress tools
                            if (toolName === 'show_needs_chart' && !isComplete) {
                              return (
                                <div key={toolPart.toolCallId} className="mt-2">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                                    <Loader size={12} />
                                    <Shimmer>Generating visualization...</Shimmer>
                                  </div>
                                </div>
                              );
                            }

                            // Hide chart - no visual element
                            if (toolName === 'hide_chart') {
                              return null;
                            }

                            // Render interactive sliders for request_slider tool
                            if (toolName === 'request_slider' && isComplete) {
                              const sliderData = toolPart.input as RequestSliderArgs;
                              const isSubmitted = handledToolCalls.current.has(toolPart.toolCallId);
                              const toolValues = sliderValues[toolPart.toolCallId] ?? {};

                              return (
                                <div key={toolPart.toolCallId} className="mt-3 w-full max-w-md">
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
                                                    [toolPart.toolCallId]: {
                                                      ...prev[toolPart.toolCallId],
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
                                          onClick={() => handleSliderSubmit(toolPart.toolCallId, sliderData.fields, toolValues)}
                                        >
                                          Submit
                                        </Button>
                                      )}
                                      {isSubmitted && (
                                        <p className="text-xs text-muted-foreground text-center">
                                          Submitted
                                        </p>
                                      )}
                                    </ArtifactContent>
                                  </Artifact>
                                </div>
                              );
                            }

                            // Loading state for in-progress slider
                            if (toolName === 'request_slider' && !isComplete) {
                              return (
                                <div key={toolPart.toolCallId} className="mt-2">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                                    <Loader size={12} />
                                    <Shimmer>Preparing question...</Shimmer>
                                  </div>
                                </div>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>
                      {message.role === 'assistant' && textContent && (
                        <MessageActions className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageAction
                            tooltip={playingMessageId === message.id ? "Stop" : "Listen"}
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
                        <DropdownMenuItem
                          onClick={() => handleFileAction("upload-file")}
                        >
                          <FileIcon className="mr-2" size={16} />
                          Upload file
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFileAction("upload-photo")}
                        >
                          <ImageIcon className="mr-2" size={16} />
                          Upload photo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFileAction("take-screenshot")}
                        >
                          <ScreenShareIcon className="mr-2" size={16} />
                          Take screenshot
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFileAction("take-photo")}
                        >
                          <CameraIcon className="mr-2" size={16} />
                          Take photo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Mic button - only shows INPUT states */}
                    <PromptInputButton
                      className={cn(
                        "!rounded-full border font-medium transition-all min-w-[140px]",
                        voiceInputState === 'recording' && "bg-red-500 text-white border-red-500 animate-pulse",
                        voiceInputState === 'transcribing' && "bg-amber-500 text-white border-amber-500"
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
                    {/* Audio output indicator - shows TTS state */}
                    {audioOutputState !== 'idle' && (
                      <PromptInputButton
                        className={cn(
                          "!rounded-full border font-medium transition-all",
                          audioOutputState === 'generating' && "bg-blue-500 text-white border-blue-500",
                          audioOutputState === 'playing' && "bg-green-500 text-white border-green-500 animate-pulse"
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

              {messages.length === 0 && (
                <Suggestions className="px-4">
                  {suggestions.map(({ icon: Icon, text, color }) => (
                    <Suggestion
                      className="font-normal"
                      key={text}
                      onClick={() => handleSuggestionClick(text)}
                      suggestion={text}
                    >
                      {Icon && <Icon size={16} style={{ color }} />}
                      {text}
                    </Suggestion>
                  ))}
                </Suggestions>
              )}
            </div>

            {/* Visualization Modal */}
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
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

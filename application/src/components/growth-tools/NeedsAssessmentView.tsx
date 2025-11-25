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
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Container from '@/components/container';
import { NeedsChart } from '@/components/growth-tools/visualizations/NeedsChart';
import type { ShowNeedsChartArgs } from '@/lib/growth-tools/types';
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
  MessageResponse
} from '@/components/ai-elements/message';
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
} from 'lucide-react';

// UI components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

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

export function NeedsAssessmentView({
  id,
  initialMessages,
}: {
  id?: string;
  initialMessages?: UIMessage[];
}) {
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<ShowNeedsChartArgs | null>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages ?? []);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isLoading = status === 'streaming' || status === 'submitted';

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
      id: id ?? nanoid(),
      messages: newMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        parts: msg.parts,
      })),
      trigger: 'submit-message',
    };

    const response = await fetch('/api/apps/growth-tools/needs-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortControllerRef.current.signal,
    });

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

    // Manual SSE parsing - bypasses buggy useChat hook
    // SSE format: "data: {json}\n\n" with [DONE] as end marker
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

        // Only handle text-delta chunks for streaming text
        if (chunk.type === 'text-delta') {
          currentText += chunk.delta;
          const textPart: TextUIPart = { type: 'text', text: currentText };

          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = {
                id: assistantMessageId,
                role: 'assistant',
                parts: [textPart],
              };
            }
            return updated;
          });
        }
      }
    }

    setStatus('ready');
  }, [messages, id]);

  // Handle tool invocations via effect
  useEffect(() => {
    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type.startsWith('tool-')) {
          const toolPart = part as { type: string; toolName?: string; state?: string; input?: unknown };
          if (toolPart.toolName === 'show_needs_chart' && toolPart.state === 'result' && !showVisualization) {
            setVisualizationData(toolPart.input as ShowNeedsChartArgs);
            setShowVisualization(true);
          }
          if (toolPart.toolName === 'hide_chart' && toolPart.state === 'result' && showVisualization) {
            setShowVisualization(false);
          }
        }
      }
    }
  }, [messages, showVisualization]);

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
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    from={message.role === 'user' ? 'user' : 'assistant'}
                  >
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
                          const toolPart = part as { type: string; toolCallId: string; toolName?: string; state?: string };
                          return (
                            <div key={toolPart.toolCallId} className="mt-2">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                {toolPart.toolName === 'show_needs_chart' && 'Generating needs visualization...'}
                                {toolPart.state === 'result' && ' ✓'}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </Message>
                ))}

                {/* Loading state */}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <Message from="assistant">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </Message>
                )}

                {/* Error state */}
                {error && (
                  <div className="text-red-500 p-4 text-sm">
                    Error: {error.message}
                  </div>
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Needs Profile</h2>
                    <button
                      onClick={() => setShowVisualization(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
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

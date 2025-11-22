'use client';

import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Container from '@/components/container';
import { NeedsChart } from '@/components/growth-tools/visualizations/NeedsChart';
import type { ShowNeedsChartArgs } from '@/lib/growth-tools/types';
import { saveChat } from '@/lib/actions'
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
  AudioWaveform as AudioWaveformIcon,
  BarChart as BarChartIcon,
  Box as BoxIcon,
  FileText as FileIcon,
  Globe as GlobeIcon,
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

export function NeedsAssessmentView({
  id,
  initialMessages,
}: {
  id?: string;
  initialMessages?: any[];
}) {
  const router = useRouter();
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<ShowNeedsChartArgs | null>(null);
  const [text, setText] = useState("");
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useMicrophone, setUseMicrophone] = useState(false);

  const { messages, append, isLoading } = useChat({
    id,
    initialMessages,
    api: '/api/apps/growth-tools/needs-assessment',
    maxSteps: 5,
    body: { model: 'gpt-4o' },
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === 'show_needs_chart') {
        const args = toolCall.args as ShowNeedsChartArgs;
        setVisualizationData(args);
        setShowVisualization(true);
        return { success: true, message: 'Chart displayed successfully' };
      } else if (toolCall.toolName === 'hide_chart') {
        setShowVisualization(false);
        return { success: true, message: 'Chart hidden' };
      }
    },
    onError: (error) => {
      console.error("Chat hook error:", error);
    },
    onFinish: async (message) => {
        if (!messages.length) {
            const newMessages = [
                ...messages,
                message,
            ]
            const chat = await saveChat({
                messages: newMessages,
                title: 'Needs Assessment',
                userId: '1' // Hardcoded userId for now
            });
            router.push(`/apps/growth-tools/needs-assessment/${chat.id}`);
        }
    }
  });

  const handleSubmit = useCallback((message: PromptInputMessage) => {
    console.log("Submitting message:", message);
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    append({ role: 'user', content: message.text || "Sent with attachments" });
    setText("");
  }, [append]);

  const handleFileAction = useCallback((action: string) => {
    toast.success("File action", {
      description: action,
    });
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    append({ role: 'user', content: suggestion });
  }, [append]);

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
                      <MessageContent
                        className={cn(
                          "group-[.is-user]:rounded-[24px] group-[.is-user]:bg-secondary group-[.is-user]:text-foreground",
                          "group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground"
                        )}
                      >
                        <MessageResponse>{message.content}</MessageResponse>
                      </MessageContent>

                      {/* Tool invocations */}
                      {message.toolInvocations?.map((toolInvocation) => (
                        <div key={toolInvocation.toolCallId} className="mt-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            {toolInvocation.toolName === 'show_needs_chart' && 'Generating needs visualization...'}
                            {toolInvocation.state === 'result' && ' ✓'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Message>
                ))}

                {/* Loading state */}
                {isLoading && (
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
                    <PromptInputButton
                      className="rounded-full border font-medium"
                      onClick={() => setUseWebSearch(!useWebSearch)}
                      variant="outline"
                    >
                      <GlobeIcon size={16} />
                      <span>Search</span>
                    </PromptInputButton>
                  </PromptInputTools>
                  <PromptInputButton
                    className="rounded-full font-medium text-foreground"
                    onClick={() => setUseMicrophone(!useMicrophone)}
                    variant="secondary"
                  >
                    <AudioWaveformIcon size={16} />
                    <span>Voice</span>
                  </PromptInputButton>
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
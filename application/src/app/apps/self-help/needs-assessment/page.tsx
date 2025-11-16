'use client';

import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ArrowLeft, CopyIcon, RefreshCwIcon, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NeedsChart } from '@/components/self-help/visualizations/NeedsChart';
import type { ShowNeedsChartArgs } from '@/lib/self-help/types';

// AI Elements components - Full utilization
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent
} from '@/components/elements/message';
import { Response } from '@/components/elements/response';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from '@/components/elements/prompt-input';
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput
} from '@/components/ai-elements/tool';
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
  Suggestions,
  Suggestion
} from '@/components/ai-elements/suggestion';
import { Context } from '@/components/ai-elements/context';
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source
} from '@/components/ai-elements/sources';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function NeedsAssessmentPage() {
  // Local state for visualization
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<ShowNeedsChartArgs | null>(null);
  const [selectedModel] = useState('gpt-4o');

  const { messages, append, input, setInput, isLoading, stop } = useChat({
    api: '/api/apps/self-help/needs-assessment',
    maxSteps: 5,
    body: { model: selectedModel },
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    append({ role: 'user', content: input });
    setInput('');
  };

  const handleSuggestionSelect = (text: string) => {
    append({ role: 'user', content: text });
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        append({ role: 'user', content: lastUserMessage.content });
      }
    }
  };

  const hasGatheredNeeds = messages.some(m =>
    m.toolInvocations?.some(t => t.toolName === 'show_needs_chart')
  );

  // Calculate token usage (simplified - would need actual token counting in production)
  const estimatedTokens = messages.reduce((acc, msg) =>
    acc + Math.ceil(msg.content.length / 4), 0
  );
  const maxTokens = 128000; // GPT-4o context window

  return (
    <div className="h-full bg-background">
      {/* No custom Container - using standard Tailwind */}
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col h-full">
          {/* Enhanced Header with Responsive Design */}
          <div className="flex items-center justify-between border-b py-3 lg:py-4 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="gap-1 sm:gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-sm sm:text-base font-medium">Needs Assessment</h1>
            </div>
            {/* Context Display - Hidden on mobile */}
            <div className="hidden md:block">
              <Context
                usedTokens={estimatedTokens}
                maxTokens={maxTokens}
                modelId={selectedModel}
              />
            </div>
          </div>

          {/* Main Content Area - Responsive Layout */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Chat Container - Full width on mobile, responsive on desktop */}
            <div className={cn(
              "flex flex-col transition-all duration-300 min-h-0",
              "w-full",
              showVisualization && "md:w-3/5 lg:w-2/3"
            )}>
              {/* Conversation Component handles scroll management automatically */}
              <Conversation className="flex-1">
                <ConversationContent>
                  {/* Empty State with AI Elements */}
                  {messages.length === 0 ? (
                    <ConversationEmptyState
                      icon={<div className="text-3xl sm:text-4xl">🌱</div>}
                      title="Needs Assessment"
                      description="Let's explore your fundamental human needs together"
                    >
                      {/* Suggestion Component for quick starts - Responsive */}
                      <div className="mt-4 w-full max-w-md mx-auto">
                        <Suggestions className="flex flex-col gap-2">
                          <Suggestion
                            suggestion="I'd like to understand my needs better"
                            onClick={handleSuggestionSelect}
                            className="w-full justify-start text-sm sm:text-base"
                          />
                          <Suggestion
                            suggestion="I'm feeling stuck in life"
                            onClick={handleSuggestionSelect}
                            className="w-full justify-start text-sm sm:text-base"
                          />
                          <Suggestion
                            suggestion="Help me explore what's missing"
                            onClick={handleSuggestionSelect}
                            className="w-full justify-start text-sm sm:text-base"
                          />
                          <Suggestion
                            suggestion="Start the assessment"
                            onClick={handleSuggestionSelect}
                            className="w-full justify-start text-sm sm:text-base"
                          />
                        </Suggestions>
                      </div>
                    </ConversationEmptyState>
                  ) : (
                    <>
                      {/* Messages with Enhanced Display */}
                      <AnimatePresence>
                        {messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="px-4 sm:px-6"
                          >
                            <Message
                              from={message.role === 'user' ? 'user' : 'assistant'}
                              className="py-4"
                            >
                              {message.role === 'assistant' && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                  <Sparkles className="h-4 w-4" />
                                </div>
                              )}

                              <MessageContent className="max-w-full">
                                {message.role === 'user' ? (
                                  <span className="text-sm sm:text-base">{message.content}</span>
                                ) : (
                                  <Response className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed">
                                    {message.content}
                                  </Response>
                                )}
                              </MessageContent>

                              {/* Enhanced Tool Display */}
                              {message.toolInvocations?.map((toolInvocation) => (
                                <Tool key={toolInvocation.toolCallId} className="mt-2">
                                  <ToolHeader
                                    type={toolInvocation.toolName}
                                    state={toolInvocation.state || 'completed'}
                                  />
                                  {(toolInvocation.args || (toolInvocation as any).result) && (
                                    <ToolContent>
                                      {toolInvocation.args && (
                                        <ToolInput input={toolInvocation.args} />
                                      )}
                                      {(toolInvocation as any).result && (
                                        <ToolOutput
                                          output={(toolInvocation as any).result}
                                          errorText={(toolInvocation as any).error}
                                        />
                                      )}
                                    </ToolContent>
                                  )}
                                </Tool>
                              ))}

                              {/* Message Actions for Assistant Messages - Responsive */}
                              {message.role === 'assistant' && (
                                <div className="flex gap-1 mt-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopyMessage(message.content)}
                                    className="h-7 px-2 hover:bg-muted"
                                  >
                                    <CopyIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleRetry}
                                    className="h-7 px-2 hover:bg-muted"
                                  >
                                    <RefreshCwIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              )}
                            </Message>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Shimmer Loading State */}
                      {isLoading && (
                        <div className="px-4 sm:px-6">
                          <Shimmer className="mt-4">
                            Analyzing your needs...
                          </Shimmer>
                        </div>
                      )}

                      {/* Sources for Psychological Frameworks */}
                      {hasGatheredNeeds && (
                        <div className="px-4 sm:px-6 mt-6">
                          <Sources>
                            <SourcesTrigger count={3}>
                              <span className="text-xs sm:text-sm">View assessment methodology</span>
                            </SourcesTrigger>
                            <SourcesContent>
                              <div className="mt-2 space-y-2">
                                <Source
                                  href="https://en.wikipedia.org/wiki/Maslow%27s_hierarchy_of_needs"
                                  className="block text-xs"
                                >
                                  Maslow's Hierarchy of Needs
                                </Source>
                                <Source
                                  href="https://selfdeterminationtheory.org"
                                  className="block text-xs"
                                >
                                  Self-Determination Theory
                                </Source>
                                <Source
                                  href="https://positivepsychology.com"
                                  className="block text-xs"
                                >
                                  Positive Psychology
                                </Source>
                              </div>
                            </SourcesContent>
                          </Sources>
                        </div>
                      )}

                      {/* Dynamic Suggestions During Conversation */}
                      {messages.length > 0 && messages.length < 5 && !isLoading && (
                        <div className="px-4 sm:px-6 mt-4">
                          <Suggestions>
                            <Suggestion
                              suggestion="Tell me more about physical needs"
                              onClick={handleSuggestionSelect}
                              className="text-xs sm:text-sm"
                            />
                            <Suggestion
                              suggestion="What about emotional needs?"
                              onClick={handleSuggestionSelect}
                              className="text-xs sm:text-sm"
                            />
                            <Suggestion
                              suggestion="How do I know what's important?"
                              onClick={handleSuggestionSelect}
                              className="text-xs sm:text-sm"
                            />
                            <Suggestion
                              suggestion="Can you show me my results?"
                              onClick={handleSuggestionSelect}
                              className="text-xs sm:text-sm"
                            />
                          </Suggestions>
                        </div>
                      )}
                    </>
                  )}
                </ConversationContent>

                {/* Automatic Scroll-to-Bottom Button */}
                <ConversationScrollButton />
              </Conversation>

              {/* Input Area - Responsive with proper spacing */}
              <div className="flex-shrink-0 border-t bg-background px-4 pb-3 pt-3 sm:px-6 sm:pb-4">
                <PromptInput onSubmit={handleSubmit} className="shadow-sm">
                  <PromptInputTextarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="text-sm sm:text-base min-h-[40px] sm:min-h-[50px]"
                  />

                  <PromptInputToolbar className="border-t-0 py-1.5">
                    <PromptInputTools>
                      {/* Tools placeholder */}
                    </PromptInputTools>

                    {isLoading ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => stop()}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <div className="h-3 w-3 rounded-sm bg-background" />
                      </Button>
                    ) : input.trim() ? (
                      <PromptInputSubmit>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                      </PromptInputSubmit>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4 opacity-50"
                        >
                          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                      </Button>
                    )}
                  </PromptInputToolbar>
                </PromptInput>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Panel - Mobile: Full screen sheet, Desktop: Side panel */}
      <Sheet open={showVisualization} onOpenChange={setShowVisualization}>
        <SheetContent
          side="right"
          className={cn(
            "w-full sm:w-[480px] md:w-[540px] lg:w-[600px]",
            "p-0"
          )}
        >
          <SheetHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b">
            <SheetTitle className="text-base sm:text-lg">Your Needs Assessment</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto">
            {visualizationData && (
              <NeedsChart
                data={visualizationData}
                onClose={() => setShowVisualization(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
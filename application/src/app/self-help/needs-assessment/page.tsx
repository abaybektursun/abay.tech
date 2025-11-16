'use client';

import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ArrowLeft, CopyIcon, RefreshCwIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Container from '@/components/container';
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
import { Button } from '@/components/ui/button';

export default function NeedsAssessmentPage() {
  // Local state for visualization
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<ShowNeedsChartArgs | null>(null);
  const [selectedModel] = useState('gpt-4o');

  const { messages, append, input, setInput, isLoading, stop } = useChat({
    api: '/api/self-help/needs-assessment',
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
    <Container>
      <div className="flex flex-col h-full">
        {/* Enhanced Header with Context Display */}
        <div className="flex items-center justify-between border-b py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="font-medium text-sm">Needs Assessment</h1>
          </div>
          {/* Context Display for Token Usage */}
          <Context
            usedTokens={estimatedTokens}
            maxTokens={maxTokens}
            modelId={selectedModel}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Chat Container - Now using AI Elements Conversation */}
          <div className={cn(
            "flex flex-col transition-all duration-300 min-h-0",
            showVisualization ? "w-3/5" : "w-full"
          )}>
            {/* Conversation Component handles scroll management automatically */}
            <Conversation className="flex-1">
              <ConversationContent>
                {/* Empty State with AI Elements */}
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    icon={<div className="text-4xl">🌱</div>}
                    title="Needs Assessment"
                    description="Let's explore your fundamental human needs together"
                  >
                    {/* Suggestion Component for quick starts */}
                    <div className="mt-4 w-full max-w-md">
                      <Suggestions className="flex flex-col gap-2">
                        <Suggestion
                          suggestion="I'd like to understand my needs better"
                          onClick={handleSuggestionSelect}
                          className="w-full justify-start"
                        />
                        <Suggestion
                          suggestion="I'm feeling stuck in life"
                          onClick={handleSuggestionSelect}
                          className="w-full justify-start"
                        />
                        <Suggestion
                          suggestion="Help me explore what's missing"
                          onClick={handleSuggestionSelect}
                          className="w-full justify-start"
                        />
                        <Suggestion
                          suggestion="Start the assessment"
                          onClick={handleSuggestionSelect}
                          className="w-full justify-start"
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
                        >
                          <Message from={message.role === 'user' ? 'user' : 'assistant'}>
                            {message.role === 'assistant' && (
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <Sparkles size={14} />
                              </div>
                            )}

                            <MessageContent>
                              {message.role === 'user' ? (
                                <span>{message.content}</span>
                              ) : (
                                <Response>{message.content}</Response>
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

                            {/* Message Actions for Assistant Messages */}
                            {message.role === 'assistant' && (
                              <div className="flex gap-1 mt-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopyMessage(message.content)}
                                  className="h-7 px-2"
                                >
                                  <CopyIcon size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleRetry}
                                  className="h-7 px-2"
                                >
                                  <RefreshCwIcon size={14} />
                                </Button>
                              </div>
                            )}
                          </Message>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Shimmer Loading State */}
                    {isLoading && (
                      <Shimmer className="mt-4">
                        Analyzing your needs...
                      </Shimmer>
                    )}

                    {/* Sources for Psychological Frameworks */}
                    {hasGatheredNeeds && (
                      <Sources className="mt-6">
                        <SourcesTrigger count={3}>
                          <span className="text-sm">View assessment methodology</span>
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
                    )}

                    {/* Dynamic Suggestions During Conversation */}
                    {messages.length > 0 && messages.length < 5 && !isLoading && (
                      <div className="mt-4">
                        <Suggestions>
                          <Suggestion
                            suggestion="Tell me more about physical needs"
                            onClick={handleSuggestionSelect}
                          />
                          <Suggestion
                            suggestion="What about emotional needs?"
                            onClick={handleSuggestionSelect}
                          />
                          <Suggestion
                            suggestion="How do I know what's important?"
                            onClick={handleSuggestionSelect}
                          />
                          <Suggestion
                            suggestion="Can you show me my results?"
                            onClick={handleSuggestionSelect}
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

            {/* Input Area - Simplified */}
            <div className="flex-shrink-0 border-t bg-background px-4 pb-4 pt-3">
              <PromptInput onSubmit={handleSubmit} className="shadow-sm">
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="text-sm"
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
                      className="h-8 w-8 p-0"
                    >
                      <div className="size-3 rounded-sm bg-background" />
                    </Button>
                  ) : input.trim() ? (
                      <PromptInputSubmit>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-4"
                        >
                          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                      </PromptInputSubmit>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled
                        className="h-8 w-8 p-0"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-4 opacity-50"
                        >
                          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                      </Button>
                    )}
                </PromptInputToolbar>
              </PromptInput>
            </div>
          </div>

          {/* Visualization Panel */}
          <AnimatePresence>
            {showVisualization && visualizationData && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '40%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="border-l bg-background overflow-hidden"
              >
                <div className="h-full overflow-y-auto p-6">
                  <NeedsChart
                    data={visualizationData}
                    onClose={() => setShowVisualization(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Container>
  );
}
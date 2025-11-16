'use client';

import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { Tool, ToolContent } from '@/components/ai-elements/tool';
import { ChatContainer } from '@/components/self-help/ChatContainer';
import { NeedsChart } from '@/components/self-help/visualizations/NeedsChart';
import { useConversationStore } from '@/lib/self-help/stores/conversation-store';
import type { ShowNeedsChartArgs } from '@/lib/self-help/types';
import { useEffect } from 'react';

export default function NeedsAssessmentPage() {
  const {
    toggleVisualization,
    startSession,
    updateSessionData,
    visualizationData,
  } = useConversationStore();

  const { messages, append, isLoading } = useChat({
    api: '/api/self-help/needs-assessment',
    onToolCall: ({ toolCall }) => {
      // Handle tool calls on the client side
      if (toolCall.toolName === 'show_needs_chart') {
        const args = toolCall.args as ShowNeedsChartArgs;
        // Show visualization panel with chart data
        toggleVisualization(true, 'needs', args);
        // Update session data
        updateSessionData({
          needs: args.needs,
          insights: args.insights,
          timestamp: new Date().toISOString(),
        });
      } else if (toolCall.toolName === 'hide_chart') {
        // Hide visualization panel
        toggleVisualization(false);
      }
    },
  });

  // Start session on mount
  useEffect(() => {
    startSession('needs-assessment');
  }, [startSession]);

  return (
    <ChatContainer
      visualizationPanel={
        visualizationData ? (
          <NeedsChart data={visualizationData as ShowNeedsChartArgs} />
        ) : null
      }
    >
      <div className="flex h-screen flex-col">
        {/* Chat Header */}
        <div className="border-b p-4">
          <h1 className="font-semibold text-lg">Needs Assessment</h1>
          <p className="text-muted-foreground text-sm">
            Let's explore which of your fundamental needs are being met
          </p>
        </div>

        {/* Conversation Area */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="max-w-md space-y-2">
                  <h2 className="font-semibold text-xl">
                    Welcome to Your Needs Assessment
                  </h2>
                  <p className="text-muted-foreground">
                    I'm here to help you explore your fundamental human needs
                    across physical, emotional, mental, and spiritual
                    dimensions. Through our conversation, we'll identify which
                    needs are being met and which might need attention.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Start by sharing what brought you here today, or simply say
                    hello.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    {message.content && (
                      <MessageContent>
                        <MessageResponse>{message.content}</MessageResponse>
                      </MessageContent>
                    )}

                    {/* Render tool calls */}
                    {message.toolInvocations?.map((tool) => (
                      <Tool key={tool.toolCallId}>
                        <ToolContent>
                          {tool.toolName === 'show_needs_chart' && (
                            <div className="text-sm">
                              <p className="text-muted-foreground">
                                ✓ Created visualization with{' '}
                                {(tool.args as ShowNeedsChartArgs).needs.length}{' '}
                                needs
                              </p>
                            </div>
                          )}
                          {tool.toolName === 'hide_chart' && (
                            <div className="text-sm">
                              <p className="text-muted-foreground">
                                ✓ Visualization hidden
                              </p>
                            </div>
                          )}
                        </ToolContent>
                      </Tool>
                    ))}
                  </Message>
                ))}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="border-t p-4">
          <PromptInput
            onSubmit={async (message) => {
              await append({
                role: 'user',
                content: message.text,
              });
            }}
          >
            <PromptInputTextarea placeholder="Share what's on your mind..." />
            <PromptInputSubmit disabled={isLoading}>Send</PromptInputSubmit>
          </PromptInput>
        </div>
      </div>
    </ChatContainer>
  );
}

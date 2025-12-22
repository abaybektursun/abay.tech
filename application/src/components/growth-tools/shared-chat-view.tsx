'use client';

import type { UIMessage, TextUIPart } from 'ai';
import { cn } from '@/lib/utils';
import { getExercise } from '@/lib/growth-tools/exercises';
import type { SharedChat } from '@/lib/shares';
import type { ShowLifeWheelArgs, RequestSliderArgs } from '@/lib/growth-tools/types';

// AI Elements
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactContent,
} from '@/components/ai-elements/artifact';

// UI components
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, BarChart2, Share2 } from 'lucide-react';

// Visualizations
import { LifeWheel } from '@/components/growth-tools/visualizations/NeedsChart';

interface SharedChatViewProps {
  chat: SharedChat;
}

export function SharedChatView({ chat }: SharedChatViewProps) {
  const messages: UIMessage[] = JSON.parse(chat.messages);
  const exercise = getExercise(chat.exerciseId);

  const renderToolPart = (part: any) => {
    const toolName = part.type.replace('tool-', '');
    const { state, input, output } = part;

    // Life wheel - show static visualization
    if (toolName === 'show_life_wheel' && state === 'output-available') {
      const wheelData = input as ShowLifeWheelArgs;
      return (
        <div className="mt-3 max-w-md">
          <LifeWheel data={wheelData} variant="compact" />
        </div>
      );
    }

    // Slider - show submitted values
    if (toolName === 'request_slider' && state === 'output-available') {
      const sliderData = input as RequestSliderArgs;
      return (
        <div className="mt-3 w-full max-w-md">
          <Artifact>
            <ArtifactContent className="p-4 space-y-3">
              <p className="text-sm font-medium">{sliderData.question}</p>
              <div className="space-y-2">
                {sliderData.fields.map((field) => {
                  const value = field.defaultValue ?? 50;
                  return (
                    <div key={field.name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{field.name}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">Submitted</p>
            </ArtifactContent>
          </Artifact>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <Share2 className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <h1 className="font-medium truncate">{chat.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exercise?.name ?? 'Growth Tools'} • Shared conversation
          </p>
        </div>
      </div>

      {/* Messages */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  isUser && 'flex-row-reverse'
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>

                <Message from={message.role}>
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
                </Message>
              </div>
            );
          })}
        </ConversationContent>
      </Conversation>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">
          This is a shared conversation. Start your own at{' '}
          <a href="/apps/growth-tools" className="text-primary hover:underline">
            Growth Tools
          </a>
        </p>
      </div>
    </div>
  );
}

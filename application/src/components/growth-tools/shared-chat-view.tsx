'use client';

import type { UIMessage, TextUIPart } from 'ai';
import { cn } from '@/lib/utils';
import { getExercise } from '@/lib/growth-tools/exercises';
import type { SharedChat } from '@/lib/shares';
import { renderToolPart } from '@/components/growth-tools/tool-renderers';

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

// UI components
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface SharedChatViewProps {
  chat: SharedChat;
}

export function SharedChatView({ chat }: SharedChatViewProps) {
  const messages: UIMessage[] = JSON.parse(chat.messages);
  const exercise = getExercise(chat.exerciseId);

  return (
    <div className="relative flex flex-col h-screen w-full">
      {/* Top header with soft fade */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="bg-background/95 backdrop-blur-sm py-4 px-6 text-center pointer-events-auto">
          <h1 className="font-medium text-foreground/90 truncate">{chat.title}</h1>
          <p className="text-sm text-muted-foreground/70">{exercise?.name ?? 'Growth Tools'}</p>
        </div>
        <div className="h-12 bg-gradient-to-b from-background/80 to-transparent" />
      </div>

      {/* Messages */}
      <Conversation className="flex-1 max-w-3xl mx-auto w-full">
        <ConversationContent className="pt-28 pb-32">
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
                        return <div key={index}>{renderToolPart(part, { readOnly: true })}</div>;
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

      {/* Bottom fade overlay with CTA */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="h-16 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="bg-background/95 backdrop-blur-sm py-4 text-center pointer-events-auto">
          <p className="text-sm text-muted-foreground/80">
            {exercise?.name ?? 'Growth Tools'} • {' '}
            <a href="/apps/growth-tools" className="text-primary/90 hover:text-primary hover:underline transition-colors">
              Start your own conversation →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

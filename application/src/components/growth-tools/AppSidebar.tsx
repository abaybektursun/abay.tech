'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, LayoutDashboard, MessagesSquare, ChevronDown, MessageCircle, MoreHorizontal, Pin, PinOff, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * LAYOUT CONSTANTS - Single source of truth for all dimensions
 * Change these values to adjust the entire sidebar layout predictably
 */
const LAYOUT = {
  /** Total sidebar width */
  width: 'w-52', // 208px - gives more room for text
  /** Chat list max height before scrolling */
  chatListHeight: 'max-h-[200px]',
} as const;

interface ChatItem {
  id: string;
  title: string;
  pinned?: boolean;
}

interface AppSidebarProps {
  chats: ChatItem[];
  isChatsOpen: boolean;
  onChatsOpenChange: (open: boolean) => void;
  onTogglePin: (chatId: string) => void;
}

/**
 * ChatListItem - A single chat entry
 * Simple, flat structure with predictable layout
 */
function ChatListItem({
  chat,
  isPinned,
  onTogglePin,
  onClick
}: {
  chat: ChatItem;
  isPinned: boolean;
  onTogglePin: () => void;
  onClick: () => void;
}) {
  return (
    <div className="group flex items-center gap-1">
      {/* Menu - shows on hover */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={onTogglePin}>
            {isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
            {isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Chat button - takes remaining space */}
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-2 px-2 py-1 text-sm text-left rounded hover:bg-accent/50 transition-colors min-w-0"
      >
        {isPinned ? (
          <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <MessageCircle className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{chat.title}</span>
      </button>
    </div>
  );
}

/**
 * ChatList - Scrollable list of chats
 * Uses native overflow instead of ScrollArea for simplicity
 */
function ChatList({
  chats,
  onTogglePin,
  onChatClick
}: {
  chats: ChatItem[];
  onTogglePin: (id: string) => void;
  onChatClick: (id: string) => void;
}) {
  const pinnedChats = chats.filter(c => c.pinned);
  const regularChats = chats.filter(c => !c.pinned);

  if (chats.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2 pl-2">
        No saved chats
      </p>
    );
  }

  return (
    <div className={`${LAYOUT.chatListHeight} overflow-y-auto space-y-1 pl-2`}>
      {/* Pinned section */}
      {pinnedChats.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide py-1">
            Pinned
          </p>
          {pinnedChats.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isPinned={true}
              onTogglePin={() => onTogglePin(chat.id)}
              onClick={() => onChatClick(chat.id)}
            />
          ))}
        </div>
      )}

      {/* Regular chats section */}
      {regularChats.length > 0 && (
        <div className="space-y-1">
          {pinnedChats.length > 0 && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide py-1 mt-2">
              Recent
            </p>
          )}
          {regularChats.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isPinned={false}
              onTogglePin={() => onTogglePin(chat.id)}
              onClick={() => onChatClick(chat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * NavButton - Consistent navigation button styling
 */
function NavButton({
  icon: Icon,
  label,
  onClick,
  delay = 0
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <Button
        variant="ghost"
        className="w-full justify-start text-sm hover:bg-accent/50"
        onClick={onClick}
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </motion.div>
  );
}

/**
 * AppSidebar - Clean, predictable sidebar component
 *
 * Layout is controlled by LAYOUT constants at the top of this file.
 * Structure is flat and easy to reason about.
 */
export function AppSidebar({
  chats,
  isChatsOpen,
  onChatsOpenChange,
  onTogglePin
}: AppSidebarProps) {
  const router = useRouter();

  const handleChatClick = (chatId: string) => {
    router.push(`/apps/growth-tools?exercise=needs-assessment&chatId=${chatId}`);
  };

  return (
    <nav className={`hidden md:block ${LAYOUT.width} shrink-0`}>
      <div className="sticky top-24 space-y-1">
        {/* Main navigation */}
        <NavButton
          icon={LayoutGrid}
          label="Exercises"
          onClick={() => router.push('/apps/growth-tools')}
          delay={0}
        />
        <NavButton
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={() => router.push('/apps/growth-tools?view=dashboard')}
          delay={0.05}
        />

        {/* Chats section */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Collapsible open={isChatsOpen} onOpenChange={onChatsOpenChange}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm hover:bg-accent/50"
              >
                <span className="flex items-center">
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  Chats
                </span>
                <motion.span
                  animate={{ rotate: isChatsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent forceMount>
              <AnimatePresence>
                {isChatsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2"
                  >
                    <ChatList
                      chats={chats}
                      onTogglePin={onTogglePin}
                      onChatClick={handleChatClick}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      </div>
    </nav>
  );
}

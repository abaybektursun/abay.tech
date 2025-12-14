'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, LayoutDashboard, MessagesSquare, ChevronDown, MessageCircle, MoreHorizontal, Pin, PinOff, Menu, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/**
 * Layout dimensions are defined in globals.css:
 * - --app-sidebar-width
 * - --app-sticky-top
 * - --chat-list-height
 */

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
    <li className="group flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label={`Options for ${chat.title}`}
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

      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-2 px-2 py-1 text-sm text-left rounded hover:bg-accent/50 focus:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors min-w-0"
        aria-label={`Open chat: ${chat.title}`}
      >
        {isPinned ? (
          <Pin className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="truncate">{chat.title}</span>
      </button>
    </li>
  );
}

/**
 * ChatList - Scrollable list of chats
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
    <div
      className="overflow-y-auto space-y-1 pl-2"
      style={{ maxHeight: 'var(--chat-list-height)' }}
      role="region"
      aria-label="Chat history"
    >
      {pinnedChats.length > 0 && (
        <section aria-labelledby="pinned-chats-heading">
          <h3 id="pinned-chats-heading" className="text-[10px] text-muted-foreground uppercase tracking-wide py-1">
            Pinned
          </h3>
          <ul className="space-y-1" aria-label="Pinned chats">
            {pinnedChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isPinned={true}
                onTogglePin={() => onTogglePin(chat.id)}
                onClick={() => onChatClick(chat.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {regularChats.length > 0 && (
        <section aria-labelledby="recent-chats-heading">
          {pinnedChats.length > 0 && (
            <h3 id="recent-chats-heading" className="text-[10px] text-muted-foreground uppercase tracking-wide py-1 mt-2">
              Recent
            </h3>
          )}
          <ul className="space-y-1" aria-label="Recent chats">
            {regularChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isPinned={false}
                onTogglePin={() => onTogglePin(chat.id)}
                onClick={() => onChatClick(chat.id)}
              />
            ))}
          </ul>
        </section>
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
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-sm hover:bg-accent/50"
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

/**
 * SidebarContent - The actual navigation content
 * Reused by both desktop nav and mobile sheet
 */
function SidebarContent({
  chats,
  isChatsOpen,
  onChatsOpenChange,
  onTogglePin,
  onNavigate,
}: {
  chats: ChatItem[];
  isChatsOpen: boolean;
  onChatsOpenChange: (open: boolean) => void;
  onTogglePin: (chatId: string) => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="space-y-1">
      <NavButton
        icon={LayoutGrid}
        label="Exercises"
        onClick={() => onNavigate('/apps/growth-tools')}
      />
      <NavButton
        icon={LayoutDashboard}
        label="Dashboard"
        onClick={() => onNavigate('/apps/growth-tools?view=dashboard')}
      />

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
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isChatsOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-2">
            <ChatList
              chats={chats}
              onTogglePin={onTogglePin}
              onChatClick={(chatId) => onNavigate(`/apps/growth-tools?exercise=needs-assessment&chatId=${chatId}`)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * AppSidebar - Responsive sidebar component
 *
 * Desktop (md+): Fixed sidebar
 * Mobile: Hamburger menu with slide-out sheet
 */
export function AppSidebar({
  chats,
  isChatsOpen,
  onChatsOpenChange,
  onTogglePin
}: AppSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setMobileOpen(false); // Close mobile sheet on navigation
    router.push(path);
  };

  return (
    <>
      {/* Mobile: Hamburger + Sheet */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-40"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Growth Tools</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <SidebarContent
                chats={chats}
                isChatsOpen={isChatsOpen}
                onChatsOpenChange={onChatsOpenChange}
                onTogglePin={onTogglePin}
                onNavigate={handleNavigate}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed sidebar */}
      <nav
        className="hidden md:block shrink-0"
        style={{ width: 'var(--app-sidebar-width)' }}
        aria-label="Main navigation"
      >
        <div
          className="sticky space-y-1"
          style={{ top: 'var(--app-sticky-top)' }}
        >
          <SidebarContent
            chats={chats}
            isChatsOpen={isChatsOpen}
            onChatsOpenChange={onChatsOpenChange}
            onTogglePin={onTogglePin}
            onNavigate={(path) => router.push(path)}
          />
        </div>
      </nav>
    </>
  );
}

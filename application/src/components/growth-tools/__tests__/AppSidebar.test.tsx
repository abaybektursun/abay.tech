/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppSidebar } from '../AppSidebar';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AppSidebar', () => {
  const defaultProps = {
    chats: [],
    isChatsOpen: true,
    onChatsOpenChange: vi.fn(),
    onTogglePin: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders navigation buttons', () => {
      render(<AppSidebar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /exercises/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /chats/i })).toBeInTheDocument();
    });

    it('renders with aria-label for accessibility', () => {
      render(<AppSidebar {...defaultProps} />);

      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });

    it('shows empty state when no chats', () => {
      render(<AppSidebar {...defaultProps} chats={[]} />);

      expect(screen.getByText(/no saved chats/i)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates to exercises when clicking Exercises button', async () => {
      const user = userEvent.setup();
      render(<AppSidebar {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /exercises/i }));

      expect(mockPush).toHaveBeenCalledWith('/apps/growth-tools');
    });

    it('navigates to dashboard when clicking Dashboard button', async () => {
      const user = userEvent.setup();
      render(<AppSidebar {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /dashboard/i }));

      expect(mockPush).toHaveBeenCalledWith('/apps/growth-tools?view=dashboard');
    });
  });

  describe('chat list', () => {
    const chatsWithPinned = [
      { id: '1', title: 'Pinned Chat', pinned: true },
      { id: '2', title: 'Regular Chat', pinned: false },
      { id: '3', title: 'Another Regular', pinned: false },
    ];

    it('renders chat items', () => {
      render(<AppSidebar {...defaultProps} chats={chatsWithPinned} />);

      expect(screen.getByText('Pinned Chat')).toBeInTheDocument();
      expect(screen.getByText('Regular Chat')).toBeInTheDocument();
      expect(screen.getByText('Another Regular')).toBeInTheDocument();
    });

    it('separates pinned and regular chats into sections', () => {
      render(<AppSidebar {...defaultProps} chats={chatsWithPinned} />);

      const pinnedSection = screen.getByRole('region', { name: /pinned/i });
      const recentSection = screen.getByRole('region', { name: /recent/i });

      expect(within(pinnedSection).getByText('Pinned Chat')).toBeInTheDocument();
      expect(within(recentSection).getByText('Regular Chat')).toBeInTheDocument();
    });

    it('shows only Recent section when no pinned chats', () => {
      const onlyRegular = [
        { id: '1', title: 'Chat 1', pinned: false },
        { id: '2', title: 'Chat 2', pinned: false },
      ];

      render(<AppSidebar {...defaultProps} chats={onlyRegular} />);

      // Should not show "Pinned" heading
      expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
      // Should not show "Recent" heading when there are no pinned
      expect(screen.queryByText('Recent')).not.toBeInTheDocument();
      // But chats should still render
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    it('navigates to chat when clicking chat item', async () => {
      const user = userEvent.setup();
      const chats = [{ id: 'chat-123', title: 'Test Chat', pinned: false }];

      render(<AppSidebar {...defaultProps} chats={chats} />);

      await user.click(screen.getByRole('button', { name: /open chat: test chat/i }));

      expect(mockPush).toHaveBeenCalledWith(
        '/apps/growth-tools?exercise=needs-assessment&chatId=chat-123'
      );
    });
  });

  describe('collapsible chats section', () => {
    it('calls onChatsOpenChange when toggling', async () => {
      const onChatsOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <AppSidebar
          {...defaultProps}
          isChatsOpen={true}
          onChatsOpenChange={onChatsOpenChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /chats/i }));

      expect(onChatsOpenChange).toHaveBeenCalled();
    });
  });

  describe('pin functionality', () => {
    it('calls onTogglePin when pin option is selected', async () => {
      const onTogglePin = vi.fn();
      const user = userEvent.setup();
      const chats = [{ id: 'chat-1', title: 'Test Chat', pinned: false }];

      render(<AppSidebar {...defaultProps} chats={chats} onTogglePin={onTogglePin} />);

      // Open the options menu
      const optionsButton = screen.getByRole('button', { name: /options for test chat/i });
      await user.click(optionsButton);

      // Click pin option
      const pinOption = screen.getByRole('menuitem', { name: /pin/i });
      await user.click(pinOption);

      expect(onTogglePin).toHaveBeenCalledWith('chat-1');
    });
  });

  describe('mobile navigation', () => {
    it('renders hamburger menu button on mobile', () => {
      render(<AppSidebar {...defaultProps} />);

      // The hamburger button should exist (visible on mobile via CSS)
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    });
  });
});

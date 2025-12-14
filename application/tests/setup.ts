import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test (only in jsdom environment)
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock CSS variables for tests (only in jsdom environment)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --app-sidebar-width: 13rem;
      --app-sticky-top: 6rem;
      --chat-list-height: 12.5rem;
    }
  `;
  document.head.appendChild(style);
}

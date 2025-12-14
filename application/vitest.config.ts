import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: [
      'src/**/*.integration.test.ts',
      'node_modules',
      'tests/growth-tools/**', // Uses custom test functions, not vitest
      'tests/unit/PersonalizedArticle.test.ts', // Uses custom test functions
    ],
    // Use jsdom for component tests, node for others
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['**/*.test.ts', 'node'],
    ],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/rate-limit.ts', 'src/components/growth-tools/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

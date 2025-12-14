import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: [
      'src/**/*.integration.test.ts',
      'node_modules',
      'tests/growth-tools/**', // Uses custom test functions, not vitest
      'tests/unit/PersonalizedArticle.test.ts', // Uses custom test functions
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/rate-limit.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

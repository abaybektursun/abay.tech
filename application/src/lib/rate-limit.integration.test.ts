import { describe, it, expect, beforeEach } from 'vitest';
import { checkTokenLimit, recordTokenUsage, _resetCache } from './rate-limit';

/**
 * Integration tests for rate-limit module.
 * Run with: pnpm test:integration
 *
 * These tests use REAL DynamoDB via SST shell.
 * They verify actual DynamoDB operations work correctly.
 */
describe('rate-limit integration', () => {
  beforeEach(() => {
    _resetCache();
  });

  it('should have DYNAMODB_TABLE env var set by SST', () => {
    expect(process.env.DYNAMODB_TABLE).toBeDefined();
    expect(process.env.DYNAMODB_TABLE).not.toBe('');
  });

  it('should check token limit successfully with real DynamoDB', async () => {
    const result = await checkTokenLimit();

    // Should return a valid response
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });

  it('should record token usage to real DynamoDB', async () => {
    // First check - initialize cache
    await checkTokenLimit();

    // Record a small amount
    await recordTokenUsage(10);

    // Should not throw and cache should be updated
    const result = await checkTokenLimit();
    expect(result.success).toBe(true);
  });

  it('should handle concurrent requests', async () => {
    const promises = Array(5).fill(null).map(() => checkTokenLimit());
    const results = await Promise.all(promises);

    results.forEach(result => {
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  it('should use cache for subsequent calls', async () => {
    // First call - fetches from DynamoDB
    const start1 = performance.now();
    await checkTokenLimit();
    const firstCallTime = performance.now() - start1;

    // Second call - should use cache
    const start2 = performance.now();
    await checkTokenLimit();
    const secondCallTime = performance.now() - start2;

    // Cached call should be much faster
    expect(secondCallTime).toBeLessThan(firstCallTime);
    expect(secondCallTime).toBeLessThan(5); // Should be sub-5ms from cache
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Set env before anything else
process.env.DYNAMODB_TABLE = 'test-table';

// Create mock at module level
const mockSend = vi.fn();

// Mock DynamoDB
vi.mock('./db', () => {
  return {
    db: {
      send: (...args: unknown[]) => mockSend(...args),
    },
  };
});

// Mock AWS SDK commands as classes
vi.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    GetCommand: class GetCommand {
      constructor(public params: unknown) {}
    },
    UpdateCommand: class UpdateCommand {
      constructor(public params: unknown) {}
    },
  };
});

// Import after mocks are set up
import { checkTokenLimit, recordTokenUsage, _resetCache } from './rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetCache(); // Reset cache before each test
    // Default: return 0 tokens for all periods
    mockSend.mockResolvedValue({ Item: { tokens: 0 } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkTokenLimit', () => {
    it('should return success when all limits are under threshold', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 1000 } });

      const result = await checkTokenLimit();

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(3); // daily, weekly, monthly (first fetch)
    });

    it('should return failure when daily limit is exceeded', async () => {
      mockSend
        .mockResolvedValueOnce({ Item: { tokens: 5_000_001 } }) // daily - over (limit is 5M)
        .mockResolvedValueOnce({ Item: { tokens: 1000 } })      // weekly - under
        .mockResolvedValueOnce({ Item: { tokens: 1000 } });     // monthly - under

      const result = await checkTokenLimit();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.limit).toBe('daily');
        expect(result.used).toBe(5_000_001);
      }
    });

    it('should return failure when weekly limit is exceeded', async () => {
      mockSend
        .mockResolvedValueOnce({ Item: { tokens: 1000 } })       // daily - under
        .mockResolvedValueOnce({ Item: { tokens: 20_000_001 } }) // weekly - over (limit is 20M)
        .mockResolvedValueOnce({ Item: { tokens: 1000 } });      // monthly - under

      const result = await checkTokenLimit();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.limit).toBe('weekly');
        expect(result.used).toBe(20_000_001);
      }
    });

    it('should return failure when monthly limit is exceeded', async () => {
      mockSend
        .mockResolvedValueOnce({ Item: { tokens: 1000 } })       // daily - under
        .mockResolvedValueOnce({ Item: { tokens: 1000 } })       // weekly - under
        .mockResolvedValueOnce({ Item: { tokens: 50_000_001 } }); // monthly - over (limit is 50M)

      const result = await checkTokenLimit();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.limit).toBe('monthly');
        expect(result.used).toBe(50_000_001);
      }
    });

    it('should handle missing Item (first request ever)', async () => {
      mockSend.mockResolvedValue({ Item: undefined });

      const result = await checkTokenLimit();

      expect(result.success).toBe(true);
    });

    it('should handle missing tokens field', async () => {
      mockSend.mockResolvedValue({ Item: {} });

      const result = await checkTokenLimit();

      expect(result.success).toBe(true);
    });

    it('should return success at exactly the limit minus one (boundary test)', async () => {
      mockSend
        .mockResolvedValueOnce({ Item: { tokens: 4_999_999 } })  // daily - under (limit is 5M)
        .mockResolvedValueOnce({ Item: { tokens: 19_999_999 } }) // weekly - under (limit is 20M)
        .mockResolvedValueOnce({ Item: { tokens: 49_999_999 } }); // monthly - under (limit is 50M)

      const result = await checkTokenLimit();

      expect(result.success).toBe(true);
    });

    it('should return failure at exactly the limit', async () => {
      mockSend
        .mockResolvedValueOnce({ Item: { tokens: 5_000_000 } }) // daily - exactly at limit (5M)
        .mockResolvedValueOnce({ Item: { tokens: 1000 } })
        .mockResolvedValueOnce({ Item: { tokens: 1000 } });

      const result = await checkTokenLimit();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.limit).toBe('daily');
      }
    });
  });

  describe('caching behavior', () => {
    it('should fetch from DynamoDB on first call', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });

      await checkTokenLimit();

      expect(mockSend).toHaveBeenCalledTimes(3); // Fetches all 3 periods
    });

    it('should use cache on subsequent calls within TTL', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });

      // First call - fetches from DB
      await checkTokenLimit();
      expect(mockSend).toHaveBeenCalledTimes(3);

      // Second call - should use cache
      await checkTokenLimit();
      expect(mockSend).toHaveBeenCalledTimes(3); // No additional calls
    });

    it('should be instant after cache is populated', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });

      // First call - populate cache
      await checkTokenLimit();

      // Measure subsequent calls
      const times: number[] = [];
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        await checkTokenLimit();
        times.push(performance.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(1); // Should be sub-millisecond
    });

    it('should update cache optimistically when recording usage', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });

      // First call - cache shows 0
      await checkTokenLimit();

      // Record usage
      await recordTokenUsage(4_000_000);

      // Check - should see updated cache without DB call
      const callsBefore = mockSend.mock.calls.length;
      const result = await checkTokenLimit();
      const callsAfter = mockSend.mock.calls.length;

      // No new DB calls for check (uses cache)
      expect(callsAfter - callsBefore).toBe(0);
      expect(result.success).toBe(true);

      // Record more to exceed limit
      await recordTokenUsage(1_500_000); // Total: 5.5M > 5M daily limit

      const result2 = await checkTokenLimit();
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.limit).toBe('daily');
      }
    });
  });

  describe('recordTokenUsage', () => {
    it('should update all three periods in DynamoDB', async () => {
      mockSend.mockResolvedValue({});

      // Need to initialize cache first
      await checkTokenLimit();
      mockSend.mockClear();

      await recordTokenUsage(1000);

      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should record correct token count', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });

      // Initialize cache
      await checkTokenLimit();
      mockSend.mockClear();
      mockSend.mockResolvedValue({});

      await recordTokenUsage(5000);

      const calls = mockSend.mock.calls;
      calls.forEach(call => {
        const cmd = call[0] as { params: { ExpressionAttributeValues: Record<string, number> } };
        expect(cmd.params.ExpressionAttributeValues[':inc']).toBe(5000);
      });
    });

    it('should use correct DynamoDB keys', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });

      // Initialize cache
      await checkTokenLimit();
      mockSend.mockClear();
      mockSend.mockResolvedValue({});

      await recordTokenUsage(1000);

      const calls = mockSend.mock.calls;
      const keys = calls.map(call => {
        const cmd = call[0] as { params: { Key: { userId: string; id: string } } };
        return cmd.params.Key;
      });

      keys.forEach(key => {
        expect(key.userId).toBe('_ratelimit');
        expect(key.id).toMatch(/^tokens_(daily|weekly|monthly)_/);
      });
    });
  });

  describe('performance', () => {
    it('first request should complete within reasonable time even with slow DB', async () => {
      // Simulate 50ms network latency per call
      mockSend.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ Item: { tokens: 0 } }), 50))
      );

      const start = performance.now();
      await checkTokenLimit();
      const elapsed = performance.now() - start;

      // Should be ~50ms (parallel), not ~150ms (sequential)
      expect(elapsed).toBeLessThan(100);
    });

    it('subsequent requests should be instant (< 1ms)', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });

      // First call - populate cache
      await checkTokenLimit();

      // Measure subsequent calls
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        await checkTokenLimit();
      }
      const elapsed = performance.now() - start;

      // 1000 calls should complete in < 100ms (0.1ms each max)
      expect(elapsed).toBeLessThan(100);
    });

    it('recordTokenUsage should not block due to parallel writes', async () => {
      mockSend.mockResolvedValue({ Item: { tokens: 0 } });
      await checkTokenLimit();

      mockSend.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({}), 30))
      );

      const start = performance.now();
      await recordTokenUsage(1000);
      const elapsed = performance.now() - start;

      // 3 parallel calls of 30ms each should take ~30-40ms, not 90ms
      expect(elapsed).toBeLessThan(60);
    });
  });
});

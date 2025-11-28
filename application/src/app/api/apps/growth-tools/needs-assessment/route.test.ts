import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock rate-limit module
const mockCheckTokenLimit = vi.fn();
const mockRecordTokenUsage = vi.fn();

vi.mock('@/lib/rate-limit', () => ({
  checkTokenLimit: () => mockCheckTokenLimit(),
  recordTokenUsage: (tokens: number) => mockRecordTokenUsage(tokens),
}));

// Mock OpenAI
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mock-model'),
}));

// Mock AI SDK streamText
const mockStreamText = vi.fn();
vi.mock('ai', () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
  tool: vi.fn((config) => config),
  convertToModelMessages: vi.fn((messages) => messages),
}));

// Mock fs for system prompt loading
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(() => 'mock prompt content'),
  },
}));

// Set env
process.env.OPENAI_API_KEY = 'test-key';
process.env.DYNAMODB_TABLE = 'test-table';

describe('needs-assessment API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckTokenLimit.mockResolvedValue({ success: true });
    mockRecordTokenUsage.mockResolvedValue(undefined);

    // Default mock for streamText
    mockStreamText.mockReturnValue({
      usage: Promise.resolve({ totalTokens: 1000 }),
      toUIMessageStreamResponse: () => new Response('stream', { status: 200 }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rate limiting', () => {
    it('should check token limit before processing', async () => {
      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      await POST(request);

      expect(mockCheckTokenLimit).toHaveBeenCalledTimes(1);
    });

    it('should return 429 when daily limit is exceeded', async () => {
      mockCheckTokenLimit.mockResolvedValue({
        success: false,
        limit: 'daily',
        used: 50001,
      });

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
      const body = await response.json();
      expect(body.error).toContain('daily');
    });

    it('should return 429 when weekly limit is exceeded', async () => {
      mockCheckTokenLimit.mockResolvedValue({
        success: false,
        limit: 'weekly',
        used: 200001,
      });

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
      const body = await response.json();
      expect(body.error).toContain('weekly');
    });

    it('should return 429 when monthly limit is exceeded', async () => {
      mockCheckTokenLimit.mockResolvedValue({
        success: false,
        limit: 'monthly',
        used: 500001,
      });

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
      const body = await response.json();
      expect(body.error).toContain('monthly');
    });

    it('should NOT call streamText when rate limited', async () => {
      mockCheckTokenLimit.mockResolvedValue({
        success: false,
        limit: 'daily',
        used: 50001,
      });

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      await POST(request);

      expect(mockStreamText).not.toHaveBeenCalled();
    });

    it('should proceed with request when under limit', async () => {
      mockCheckTokenLimit.mockResolvedValue({ success: true });

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockStreamText).toHaveBeenCalled();
    });

    it('should record token usage after successful response', async () => {
      const usagePromise = Promise.resolve({ totalTokens: 1500 });
      mockStreamText.mockReturnValue({
        usage: usagePromise,
        toUIMessageStreamResponse: () => new Response('stream', { status: 200 }),
      });

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      await POST(request);

      // Wait for the usage promise to resolve and trigger recording
      await usagePromise;
      // Small delay to allow the .then() callback to execute
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRecordTokenUsage).toHaveBeenCalledWith(1500);
    });

    it('should NOT record usage when totalTokens is undefined', async () => {
      const usagePromise = Promise.resolve({ totalTokens: undefined });
      mockStreamText.mockReturnValue({
        usage: usagePromise,
        toUIMessageStreamResponse: () => new Response('stream', { status: 200 }),
      });

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      await POST(request);
      await usagePromise;
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRecordTokenUsage).not.toHaveBeenCalled();
    });
  });

  describe('performance - rate limit check should not block', () => {
    it('should complete rate limit check quickly even under load', async () => {
      // Simulate fast DynamoDB response
      mockCheckTokenLimit.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 10))
      );

      const { POST } = await import('./route');

      const times: number[] = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] }),
        });

        const start = performance.now();
        await POST(request);
        times.push(performance.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

      // Should be fast - rate limit adds minimal overhead
      expect(avgTime).toBeLessThan(100);
    });

    it('token recording should not block response', async () => {
      let recordingResolved = false;

      mockRecordTokenUsage.mockImplementation(() =>
        new Promise(resolve => {
          setTimeout(() => {
            recordingResolved = true;
            resolve(undefined);
          }, 100);
        })
      );

      const { POST } = await import('./route');

      const request = new Request('http://localhost/api/apps/growth-tools/needs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      const start = performance.now();
      const response = await POST(request);
      const elapsed = performance.now() - start;

      // Response should return before token recording completes
      expect(response.status).toBe(200);
      expect(elapsed).toBeLessThan(50); // Much faster than the 100ms recording delay
      expect(recordingResolved).toBe(false); // Recording hasn't finished yet
    });
  });
});

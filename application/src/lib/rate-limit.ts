import { db } from './db';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Global limits (tokens)
const DAILY_LIMIT = 5_000_000;
const WEEKLY_LIMIT = 20_000_000;
const MONTHLY_LIMIT = 50_000_000;

// Cache TTL in milliseconds
const CACHE_TTL = 30_000; // 30 seconds

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

// In-memory cache
let cache = { daily: 0, weekly: 0, monthly: 0, fetchedAt: 0 };

function getWindowKey(period: 'daily' | 'weekly' | 'monthly'): string {
  const now = new Date();
  if (period === 'daily') {
    return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  }
  if (period === 'weekly') {
    const week = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
    return `week-${week}`;
  }
  return `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
}

async function getTokenCount(period: 'daily' | 'weekly' | 'monthly'): Promise<number> {
  const windowKey = getWindowKey(period);
  const result = await db.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { userId: '_ratelimit', id: `tokens_${period}_${windowKey}` },
  }));
  return result.Item?.tokens ?? 0;
}

async function addTokens(period: 'daily' | 'weekly' | 'monthly', tokens: number) {
  const windowKey = getWindowKey(period);
  await db.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId: '_ratelimit', id: `tokens_${period}_${windowKey}` },
    UpdateExpression: 'SET #tokens = if_not_exists(#tokens, :zero) + :inc',
    ExpressionAttributeNames: { '#tokens': 'tokens' },
    ExpressionAttributeValues: { ':zero': 0, ':inc': tokens },
  }));
}

async function refreshCache() {
  const [daily, weekly, monthly] = await Promise.all([
    getTokenCount('daily'),
    getTokenCount('weekly'),
    getTokenCount('monthly'),
  ]);
  cache = { daily, weekly, monthly, fetchedAt: Date.now() };
}

export async function checkTokenLimit() {
  const now = Date.now();
  const isStale = now - cache.fetchedAt > CACHE_TTL;

  if (isStale) {
    if (cache.fetchedAt === 0) {
      // First request ever - must wait for initial fetch
      await refreshCache();
    } else {
      // Background refresh - don't block the request
      refreshCache();
    }
  }

  // Instant check against cached values
  if (cache.daily >= DAILY_LIMIT) {
    return { success: false as const, limit: 'daily', used: cache.daily };
  }
  if (cache.weekly >= WEEKLY_LIMIT) {
    return { success: false as const, limit: 'weekly', used: cache.weekly };
  }
  if (cache.monthly >= MONTHLY_LIMIT) {
    return { success: false as const, limit: 'monthly', used: cache.monthly };
  }

  return { success: true as const };
}

export async function recordTokenUsage(tokens: number) {
  // Update DynamoDB
  await Promise.all([
    addTokens('daily', tokens),
    addTokens('weekly', tokens),
    addTokens('monthly', tokens),
  ]);

  // Update local cache immediately (optimistic)
  cache.daily += tokens;
  cache.weekly += tokens;
  cache.monthly += tokens;
}

// For testing: reset cache
export function _resetCache() {
  cache = { daily: 0, weekly: 0, monthly: 0, fetchedAt: 0 };
}

# Rate Limiting Implementation Plan

## Overview
Implement **global token-based** rate limiting using **DynamoDB**.

Track actual LLM token usage (not API requests) to control costs.

---

## What the Limits Mean

Limits are counted in **LLM tokens**:
- `DAILY_LIMIT = 50_000` → 50K tokens per day
- `WEEKLY_LIMIT = 200_000` → 200K tokens per week
- `MONTHLY_LIMIT = 500_000` → 500K tokens per month

**Cost reference (GPT-4o):**
- ~$2.50/1M input tokens, ~$10/1M output tokens
- 500K tokens/month ≈ $1-3/month

---

## How It Works

1. **Before request:** Check if cumulative tokens exceed limit → block if over
2. **After response:** Get `usage` from AI SDK → add to cumulative count

---

## File: `src/lib/rate-limit.ts`

```typescript
import { db } from './db';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Global limits (tokens)
const DAILY_LIMIT = 50_000;
const WEEKLY_LIMIT = 200_000;
const MONTHLY_LIMIT = 500_000;

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

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

export async function checkTokenLimit() {
  const [daily, weekly, monthly] = await Promise.all([
    getTokenCount('daily'),
    getTokenCount('weekly'),
    getTokenCount('monthly'),
  ]);

  if (daily >= DAILY_LIMIT) {
    return { success: false, limit: 'daily', used: daily };
  }
  if (weekly >= WEEKLY_LIMIT) {
    return { success: false, limit: 'weekly', used: weekly };
  }
  if (monthly >= MONTHLY_LIMIT) {
    return { success: false, limit: 'monthly', used: monthly };
  }

  return { success: true };
}

export async function recordTokenUsage(tokens: number) {
  await Promise.all([
    addTokens('daily', tokens),
    addTokens('weekly', tokens),
    addTokens('monthly', tokens),
  ]);
}
```

---

## Usage in Route

```typescript
import { checkTokenLimit, recordTokenUsage } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Check before
  const limit = await checkTokenLimit();
  if (!limit.success) {
    return Response.json(
      { error: `Token limit exceeded (${limit.limit}). Try again later.`, code: 'RATE_LIMIT' },
      { status: 429 }
    );
  }

  const result = streamText({ ... });

  // Record after (non-blocking)
  result.usage.then(usage => {
    recordTokenUsage(usage.totalTokens);
  });

  return result.toUIMessageStreamResponse();
}
```

---

## Client-Side: Beautiful Toast Notification

Uses existing **Sonner** toast library (already installed).

In `NeedsAssessmentView.tsx`, handle 429 response:

```typescript
if (response.status === 429) {
  const { error } = await response.json();
  toast.error('Usage Limit Reached', {
    description: error || 'Please try again later.',
    duration: 5000,
  });
  setStatus('ready');
  return;
}
```

---

## Configuration

Edit these 3 constants in `src/lib/rate-limit.ts`:

```typescript
const DAILY_LIMIT = 50_000;     // tokens per day
const WEEKLY_LIMIT = 200_000;   // tokens per week
const MONTHLY_LIMIT = 500_000;  // tokens per month
```

---

## Files to Modify

1. **REWRITE**: `src/lib/rate-limit.ts` (token-based using DynamoDB)
2. **UPDATE**: `route.ts` (add token recording after stream)
3. `transcribe/route.ts` and `speak/route.ts` - these use different APIs, may need separate handling

---

## No New Dependencies

Uses existing `@aws-sdk/lib-dynamodb`.

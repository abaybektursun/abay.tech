import { db } from '@/lib/db';
import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { _resetCache } from '@/lib/rate-limit';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(null, { status: 404 });
  }

  const scan = await db.send(new ScanCommand({
    TableName: process.env.DYNAMODB_TABLE,
    FilterExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': '_ratelimit' },
  }));

  for (const item of scan.Items ?? []) {
    await db.send(new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { userId: item.userId, id: item.id },
    }));
  }

  // Also reset in-memory cache
  _resetCache();

  return Response.json({ deleted: scan.Items?.length ?? 0 });
}

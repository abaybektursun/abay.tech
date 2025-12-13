'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  QueryCommand,
  GetCommand,
  DeleteCommand,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { db } from '@/lib/db'
import type { UIMessage } from 'ai'

const TableName = process.env.DYNAMODB_TABLE

/**
 * Safely serialize UIMessage[] for storage.
 * UIMessage objects from the AI SDK can contain circular references
 * or non-serializable properties (especially in providerMetadata and tool results).
 * This function extracts only the known serializable properties.
 */
function serializeMessages(messages: UIMessage[]): string {
  const sanitized = messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts.map(part => {
      // Handle each part type, extracting only serializable data
      switch (part.type) {
        case 'text':
          return {
            type: 'text',
            text: part.text,
          }
        case 'reasoning':
          return {
            type: 'reasoning',
            text: part.text,
          }
        case 'step-start':
          return { type: 'step-start' }
        case 'source-url':
          return {
            type: 'source-url',
            sourceId: part.sourceId,
            url: part.url,
            title: part.title,
          }
        case 'file':
          return {
            type: 'file',
            mediaType: part.mediaType,
            url: part.url,
            filename: part.filename,
          }
        default:
          // For tool parts (type: 'tool-*') and other dynamic types,
          // safely extract properties avoiding circular refs
          try {
            // Attempt direct serialization of the part
            const serialized = JSON.parse(JSON.stringify(part))
            return serialized
          } catch {
            // If serialization fails, extract known safe properties
            const safePart: Record<string, unknown> = { type: part.type }
            if ('toolInvocationId' in part) safePart.toolInvocationId = part.toolInvocationId
            if ('toolName' in part) safePart.toolName = part.toolName
            if ('state' in part) safePart.state = part.state
            // For args/result, try to serialize them individually
            if ('args' in part) {
              try {
                safePart.args = JSON.parse(JSON.stringify(part.args))
              } catch {
                safePart.args = '[Unserializable]'
              }
            }
            if ('result' in part) {
              try {
                safePart.result = JSON.parse(JSON.stringify(part.result))
              } catch {
                safePart.result = '[Unserializable]'
              }
            }
            return safePart
          }
      }
    }),
  }))

  return JSON.stringify(sanitized)
}

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ExpressionAttributeNames: {
      '#p': 'path',
    },
    ProjectionExpression: 'id, title, #p, createdAt, pinned',
  })

  const response = await db.send(command)
  const items = response.Items ?? []
  // Sort by createdAt descending (newest first)
  return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

export async function getChat(id: string, userId: string) {
  const command = new GetCommand({
    TableName,
    Key: {
      userId,
      id,
    },
  })

  const response = await db.send(command)
  return response.Item ?? null
}

export async function removeChat({ id, path, userId }: { id: string; path: string, userId: string }) {
    if (!userId) {
        return { error: 'Unauthorized' }
    }
  const command = new DeleteCommand({
    TableName,
    Key: {
      userId,
      id,
    },
  })

  await db.send(command)

  revalidatePath('/')
  revalidatePath(path)
  redirect('/')
}

export async function clearChats(userId?: string | null) {
    if (!userId) {
        return { error: 'Unauthorized' }
    }
    
  // First, get all chats for the user
  const chats = await getChats(userId)

  if (chats.length === 0) {
    return
  }

  // Then, create delete requests for each chat
  const deleteRequests = chats.map((chat) => ({
    DeleteRequest: {
      Key: {
        userId,
        id: chat.id,
      },
    },
  }))

  // Batch delete all chats
  const command = new BatchWriteCommand({
    RequestItems: {
      [TableName!]: deleteRequests,
    },
  })

  await db.send(command)

  revalidatePath('/')
  redirect('/')
}

export async function saveChat(chat: {
  id: string
  messages: UIMessage[]
  userId: string
}) {
  // Extract title from first user message
  const firstUserMessage = chat.messages.find(m => m.role === 'user')
  const firstTextPart = firstUserMessage?.parts.find(p => p.type === 'text')
  const title = firstTextPart && 'text' in firstTextPart
    ? firstTextPart.text.substring(0, 100)
    : 'New Chat'

  const item = {
    userId: chat.userId,
    id: chat.id,
    title,
    createdAt: Date.now(),
    path: `/apps/growth-tools/needs-assessment/${chat.id}`,
    messages: serializeMessages(chat.messages),
  }

  const command = new PutCommand({
    TableName,
    Item: item,
  })

  await db.send(command)
  revalidatePath('/apps/growth-tools')
}

// Batch migrate chats from localStorage to DynamoDB
// Messages are stored as-is (JSON stringified) - format is UIMessage[]
export async function migrateChats(chats: {
  id: string
  title: string
  createdAt: number
  messages: unknown[]
}[], userId: string) {
  if (!userId || chats.length === 0) return { success: false }

  // DynamoDB BatchWrite supports max 25 items per request
  const batches = []
  for (let i = 0; i < chats.length; i += 25) {
    batches.push(chats.slice(i, i + 25))
  }

  for (const batch of batches) {
    const putRequests = batch.map(chat => ({
      PutRequest: {
        Item: {
          userId,
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          path: `/apps/growth-tools/needs-assessment/${chat.id}`,
          messages: JSON.stringify(chat.messages),
        },
      },
    }))

    const command = new BatchWriteCommand({
      RequestItems: {
        [TableName!]: putRequests,
      },
    })

    await db.send(command)
  }

  revalidatePath('/apps/growth-tools')
  return { success: true }
}

export async function toggleChatPin(id: string, userId: string): Promise<boolean> {
  const chat = await getChat(id, userId)
  if (!chat) return false

  const newPinned = !chat.pinned

  const command = new UpdateCommand({
    TableName,
    Key: { userId, id },
    UpdateExpression: 'SET pinned = :pinned',
    ExpressionAttributeValues: {
      ':pinned': newPinned,
    },
  })

  await db.send(command)
  revalidatePath('/apps/growth-tools')
  return newPinned
}

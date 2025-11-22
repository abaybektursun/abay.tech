'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  QueryCommand,
  GetCommand,
  DeleteCommand,
  PutCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { nanoid } from 'nanoid'

import { db } from '@/lib/db'
import { CoreMessage } from 'ai'

const TableName = process.env.DYNAMODB_TABLE

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
    ProjectionExpression: 'id, title, path', // Only fetch necessary fields
  })

  const response = await db.send(command)
  return response.Items ?? []
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
  title: string
  messages: CoreMessage[]
  userId: string
}) {
  const newChat = {
    userId: chat.userId,
    id: nanoid(),
    title: chat.messages[0].content.substring(0, 100),
    createdAt: Date.now(),
    path: `/apps/growth-tools/needs-assessment/${nanoid()}`,
    messages: JSON.stringify(chat.messages),
  }

  const command = new PutCommand({
    TableName,
    Item: newChat,
  })

  await db.send(command)
  revalidatePath(`/apps/growth-tools/needs-assessment/${newChat.id}`)
  return newChat
}

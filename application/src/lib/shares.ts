'use server'

import {
  GetCommand,
  DeleteCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb'
import { db } from '@/lib/db'
import { getChat } from '@/lib/actions'
import { auth } from '@/auth'

const SharesTable = process.env.SHARES_TABLE

export interface Share {
  chatId: string
  userId: string
  createdAt: number
}

export interface SharedChat {
  id: string
  title: string
  exerciseId: string
  messages: string
  createdAt: number
  sharedAt: number
}

/**
 * Get share record by chatId
 */
async function getShare(chatId: string): Promise<Share | null> {
  const command = new GetCommand({
    TableName: SharesTable,
    Key: { chatId },
  })

  const response = await db.send(command)
  return (response.Item as Share) ?? null
}

/**
 * Check if a chat is shared
 */
export async function isShared(chatId: string): Promise<boolean> {
  const share = await getShare(chatId)
  return share !== null
}

/**
 * Share a chat - creates a share record
 * Returns the share URL path
 */
export async function shareChat(chatId: string): Promise<string> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.email

  // Verify ownership
  const chat = await getChat(chatId, userId)
  if (!chat) {
    throw new Error('Chat not found')
  }

  const share: Share = {
    chatId,
    userId,
    createdAt: Date.now(),
  }

  const command = new PutCommand({
    TableName: SharesTable,
    Item: share,
  })

  await db.send(command)
  return `/share/${chatId}`
}

/**
 * Unshare a chat - removes the share record
 */
export async function unshareChat(chatId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.email

  // Verify ownership
  const share = await getShare(chatId)
  if (!share || share.userId !== userId) {
    throw new Error('Not found or not authorized')
  }

  const command = new DeleteCommand({
    TableName: SharesTable,
    Key: { chatId },
  })

  await db.send(command)
}

/**
 * Get a shared chat by chatId (public - no auth required)
 * Returns null if not shared or not found
 */
export async function getSharedChat(chatId: string): Promise<SharedChat | null> {
  const share = await getShare(chatId)
  if (!share) {
    return null
  }

  const chat = await getChat(chatId, share.userId)
  if (!chat) {
    return null
  }

  return {
    id: chat.id,
    title: chat.title,
    exerciseId: chat.exerciseId,
    messages: chat.messages,
    createdAt: chat.createdAt,
    sharedAt: share.createdAt,
  }
}

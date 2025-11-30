'use server'

import {
  QueryCommand,
  GetCommand,
  DeleteCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

const TableName = process.env.ARTIFACTS_TABLE

export interface Artifact {
  userId: string
  id: string
  chatId: string
  exerciseId: string
  type: string
  title: string
  data: string
  pinned: boolean
  createdAt: number
}

export async function getArtifacts(userId: string): Promise<Artifact[]> {
  if (!userId) return []

  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ScanIndexForward: false, // newest first
  })

  const response = await db.send(command)
  return (response.Items ?? []) as Artifact[]
}

export async function getPinnedArtifacts(userId: string): Promise<Artifact[]> {
  const artifacts = await getArtifacts(userId)
  return artifacts.filter(a => a.pinned)
}

export async function getArtifact(userId: string, id: string): Promise<Artifact | null> {
  const command = new GetCommand({
    TableName,
    Key: { userId, id },
  })

  const response = await db.send(command)
  return (response.Item as Artifact) ?? null
}

export async function saveArtifact(artifact: Omit<Artifact, 'id' | 'createdAt' | 'pinned'>): Promise<Artifact> {
  const item: Artifact = {
    ...artifact,
    id: randomUUID(),
    pinned: false,
    createdAt: Date.now(),
  }

  const command = new PutCommand({
    TableName,
    Item: item,
  })

  await db.send(command)
  return item
}

export async function togglePin(userId: string, id: string): Promise<boolean> {
  // First get current state
  const artifact = await getArtifact(userId, id)
  if (!artifact) return false

  const newPinned = !artifact.pinned

  const command = new UpdateCommand({
    TableName,
    Key: { userId, id },
    UpdateExpression: 'SET pinned = :pinned',
    ExpressionAttributeValues: {
      ':pinned': newPinned,
    },
  })

  await db.send(command)
  return newPinned
}

export async function deleteArtifact(userId: string, id: string): Promise<void> {
  const command = new DeleteCommand({
    TableName,
    Key: { userId, id },
  })

  await db.send(command)
}

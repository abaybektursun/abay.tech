import { auth } from '@/auth'
import { getArtifacts, togglePin, deleteArtifact, saveArtifact } from '@/lib/artifacts'

// Use email as userId since NextAuth doesn't include id by default
function getUserId(session: any): string | null {
  return session?.user?.email || session?.user?.id || null
}

export async function GET() {
  const session = await auth()
  const userId = getUserId(session)

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const artifacts = await getArtifacts(userId)
  return Response.json(artifacts)
}

export async function PUT(req: Request) {
  const session = await auth()
  const userId = getUserId(session)

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()

  if (!id) {
    return Response.json({ error: 'Artifact ID required' }, { status: 400 })
  }

  const newPinned = await togglePin(userId, id)
  return Response.json({ pinned: newPinned })
}

export async function POST(req: Request) {
  const session = await auth()
  const userId = getUserId(session)

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { chatId, exerciseId, type, title, data } = await req.json()

  if (!chatId || !exerciseId || !type || !title) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const artifact = await saveArtifact({
    userId,
    chatId,
    exerciseId,
    type,
    title,
    data: JSON.stringify(data),
  })

  return Response.json(artifact)
}

export async function DELETE(req: Request) {
  const session = await auth()
  const userId = getUserId(session)

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()

  if (!id) {
    return Response.json({ error: 'Artifact ID required' }, { status: 400 })
  }

  await deleteArtifact(userId, id)
  return Response.json({ success: true })
}

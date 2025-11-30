import { auth } from '@/app/(auth)/auth'
import { getArtifacts, togglePin, deleteArtifact, saveArtifact } from '@/lib/artifacts'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const artifacts = await getArtifacts(session.user.id)
  return Response.json(artifacts)
}

export async function PUT(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()

  if (!id) {
    return Response.json({ error: 'Artifact ID required' }, { status: 400 })
  }

  const newPinned = await togglePin(session.user.id, id)
  return Response.json({ pinned: newPinned })
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { chatId, exerciseId, type, title, data } = await req.json()

  if (!chatId || !exerciseId || !type || !title) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const artifact = await saveArtifact({
    userId: session.user.id,
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

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()

  if (!id) {
    return Response.json({ error: 'Artifact ID required' }, { status: 400 })
  }

  await deleteArtifact(session.user.id, id)
  return Response.json({ success: true })
}

import { getChat } from '@/lib/actions'
import { NeedsAssessmentView } from '@/components/growth-tools/NeedsAssessmentView'
import { notFound } from 'next/navigation'

export default async function NeedsAssessmentChatPage({
  params,
}: {
  params: { id: string }
}) {
  const chat = await getChat(params.id, '1') // Hardcoded userId for now

  if (!chat) {
    notFound()
  }

  return (
    <NeedsAssessmentView
      id={chat.id as string}
      initialMessages={JSON.parse(chat.messages as string) as any[]}
    />
  )
}
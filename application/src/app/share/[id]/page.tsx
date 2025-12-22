import { notFound } from 'next/navigation';
import { getSharedChat } from '@/lib/shares';
import { SharedChatView } from '@/components/growth-tools/shared-chat-view';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const chat = await getSharedChat(id);

  if (!chat) {
    notFound();
  }

  return (
    <main className="h-screen bg-background">
      <SharedChatView chat={chat} />
    </main>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const chat = await getSharedChat(id);

  if (!chat) {
    return { title: 'Shared Chat Not Found' };
  }

  return {
    title: `${chat.title} | Shared Conversation`,
  };
}

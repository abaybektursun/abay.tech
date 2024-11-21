import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Chat as PreviewChat } from 'ai-chatbot/components/chat';
import { DEFAULT_MODEL_NAME, models } from 'ai-chatbot/lib/ai/models';
import { getChatById, getMessagesByChatId } from 'ai-chatbot/lib/db/queries';
import { convertToUIMessages } from 'ai-chatbot/lib/utils';

export default async function Page(props: { 
  params: Promise<{ id: string }> 
}) {
  try {
    const params = await props.params;
    const chatId = await params.id;
    
    console.log('Attempting to fetch chat with ID:', chatId);

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      console.log('No chat found with ID:', chatId);
      return notFound();
    }

    // Check user authorization
    /*if (session.user.id !== chat.userId) {
      console.log('User not authorized to view this chat');
      return notFound();
    }*/

    const messagesFromDb = await getMessagesByChatId({ id: chatId });
    console.log('Found messages:', messagesFromDb.length);

    const cookieStore = await cookies();
    const modelIdFromCookie = await cookieStore.get('model-id')?.value;
    const selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;

    return (
      <PreviewChat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
      />
    );
  } catch (error) {
    console.error('Error in chat page:', error);
    throw error;
  }
}
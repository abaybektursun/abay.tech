import { cookies } from 'next/headers';
import { Chat } from 'ai-chatbot/components/chat';
import { DEFAULT_MODEL_NAME, models } from 'ai-chatbot/lib/ai/models';
import { generateUUID } from 'ai-chatbot/lib/utils';
import { SidebarProvider } from 'ai-chatbot/components/ui/sidebar';
import Container from '@/components/container';

export default async function Page() {
  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId = models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME;

  return (
    <Container>
    <SidebarProvider>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
      />
    </SidebarProvider>
    </Container>
  );
}
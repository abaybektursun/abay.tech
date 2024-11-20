import { getChatsByUserId } from 'ai-chatbot/lib/db/queries';
const USERID = '1';

export async function GET() {

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: USERID! });
  return Response.json(chats);
}

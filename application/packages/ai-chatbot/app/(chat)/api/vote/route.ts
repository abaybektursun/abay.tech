// app/api/vote/route.ts
type Vote = {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
  count: number;
};

// In-memory store for votes (replace with your preferred storage solution)
const votes = new Map<string, Vote>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  // Return votes for the chat
  const chatVotes = Array.from(votes.values()).filter(v => v.chatId === chatId);
  return Response.json(chatVotes, { status: 200 });
}

export async function PATCH(request: Request) {
  const { chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' } = 
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  const voteKey = `${chatId}:${messageId}`;
  const existingVote = votes.get(voteKey);

  if (existingVote) {
    existingVote.type = type;
    votes.set(voteKey, existingVote);
  } else {
    votes.set(voteKey, {
      chatId,
      messageId,
      type,
      count: 1
    });
  }

  return new Response('Message voted', { status: 200 });
}
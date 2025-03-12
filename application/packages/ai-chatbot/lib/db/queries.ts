'server-only';
import { type User, type Suggestion, type Message } from './schema';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = process.env.IS_LOCAL 
  ? join(process.cwd(), 'data')
  : join('/tmp', 'data');

const PATHS = {
  users: join(DATA_DIR, 'users.json'),
  chats: join(DATA_DIR, 'chats.json'),
  messages: join(DATA_DIR, 'messages.json'),
  votes: join(DATA_DIR, 'votes.json'),
  documents: join(DATA_DIR, 'documents.json'),
  suggestions: join(DATA_DIR, 'suggestions.json')
};

// Initialize data directory and files if they don't exist
async function initializeDataFiles() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  
  for (const path of Object.values(PATHS)) {
    if (!existsSync(path)) {
      await writeFile(path, '[]', 'utf-8');
    }
  }
}

// Helper functions to read and write data
async function readData(path: string) {
  try {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeData(path: string, data: any) {
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize data files
initializeDataFiles();

const USERID = '1';

export async function createUser(email: string, password: string) {
  const users = await readData(PATHS.users);
  const user = { id: USERID, email, password };
  users.push(user);
  await writeData(PATHS.users, users);
  return user;
}

export async function getUser(email: string): Promise<Array<User>> {
  const users = await readData(PATHS.users);
  return users.filter((u: User) => u.email === email);
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  const chats = await readData(PATHS.chats);
  const chat = { id, userId, title, createdAt: new Date().toISOString() };
  chats.push(chat);
  await writeData(PATHS.chats, chats);
  return chat;
}

export async function deleteChatById({ id }: { id: string }) {
  const chats = await readData(PATHS.chats);
  const messages = await readData(PATHS.messages);
  const votes = await readData(PATHS.votes);
  
  const filteredChats = chats.filter((c: any) => c.id !== id);
  const filteredMessages = messages.filter((m: any) => m.chatId !== id);
  const filteredVotes = votes.filter((v: any) => v.chatId !== id);
  
  await writeData(PATHS.chats, filteredChats);
  await writeData(PATHS.messages, filteredMessages);
  await writeData(PATHS.votes, filteredVotes);
}

export async function getChatsByUserId({ id }: { id: string }) {
  const chats = await readData(PATHS.chats);
  return chats
    .filter((c: any) => c.userId === id)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getChatById({ id }: { id: string }) {
  const chats = await readData(PATHS.chats);
  return chats.find((c: any) => c.id === id);
}

export async function saveMessages({ messages: newMessages }: { messages: Array<Message> }) {
  const messages = await readData(PATHS.messages);
  const messagesWithTimestamp = newMessages.map(m => ({
    ...m,
    createdAt: new Date().toISOString()
  }));
  messages.push(...messagesWithTimestamp);
  await writeData(PATHS.messages, messages);
  return messagesWithTimestamp;
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const messages = await readData(PATHS.messages);
  return messages
    .filter((m: any) => m.chatId === id)
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  const votes = await readData(PATHS.votes);
  const existingVoteIndex = votes.findIndex((v: any) => v.messageId === messageId);
  
  if (existingVoteIndex !== -1) {
    votes[existingVoteIndex].isUpvoted = type === 'up';
    await writeData(PATHS.votes, votes);
    return votes[existingVoteIndex];
  }
  
  const vote = { chatId, messageId, isUpvoted: type === 'up' };
  votes.push(vote);
  await writeData(PATHS.votes, votes);
  return vote;
}

export async function getVotesByChatId({ id }: { id: string }) {
  const votes = await readData(PATHS.votes);
  return votes.filter((v: any) => v.chatId === id);
}

export async function saveDocument({
  id,
  title,
  content,
  userId,
}: {
  id: string;
  title: string;
  content: string;
  userId: string;
}) {
  const documents = await readData(PATHS.documents);
  const doc = { id, title, content, userId, createdAt: new Date().toISOString() };
  documents.push(doc);
  await writeData(PATHS.documents, documents);
  return doc;
}

export async function getDocumentsById({ id }: { id: string }) {
  const documents = await readData(PATHS.documents);
  return documents
    .filter((d: any) => d.id === id)
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getDocumentById({ id }: { id: string }) {
  const documents = await readData(PATHS.documents);
  return documents
    .filter((d: any) => d.id === id)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  const documents = await readData(PATHS.documents);
  const suggestions = await readData(PATHS.suggestions);
  
  const filteredDocuments = documents.filter((d: any) => 
    !(d.id === id && new Date(d.createdAt) > timestamp)
  );
  const filteredSuggestions = suggestions.filter((s: any) => 
    !(s.documentId === id && new Date(s.documentCreatedAt) > timestamp)
  );
  
  await writeData(PATHS.documents, filteredDocuments);
  await writeData(PATHS.suggestions, filteredSuggestions);
  return filteredDocuments;
}

export async function saveSuggestions({
  suggestions: newSuggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  const suggestions = await readData(PATHS.suggestions);
  const suggestionsWithTimestamp = newSuggestions.map(s => ({
    ...s,
    createdAt: new Date().toISOString()
  }));
  suggestions.push(...suggestionsWithTimestamp);
  await writeData(PATHS.suggestions, suggestions);
  return suggestionsWithTimestamp;
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  const suggestions = await readData(PATHS.suggestions);
  return suggestions.filter((s: any) => s.documentId === documentId);
}
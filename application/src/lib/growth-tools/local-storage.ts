import { UIMessage } from 'ai';

const STORAGE_KEY = 'growth-tools-chats';

export interface LocalChat {
  id: string;
  title: string;
  createdAt: number;
  messages: UIMessage[];
}

export function getLocalChats(): LocalChat[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const chats: LocalChat[] = JSON.parse(stored);
  // Sort by createdAt descending (newest first)
  return chats.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function saveLocalChat(chat: LocalChat): void {
  const chats = getLocalChats();
  const existingIndex = chats.findIndex(c => c.id === chat.id);

  if (existingIndex >= 0) {
    chats[existingIndex] = chat;
  } else {
    chats.push(chat);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function getLocalChat(id: string): LocalChat | null {
  const chats = getLocalChats();
  return chats.find(c => c.id === id) || null;
}

export function deleteLocalChat(id: string): void {
  const chats = getLocalChats();
  const filtered = chats.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearLocalChats(): void {
  localStorage.removeItem(STORAGE_KEY);
}

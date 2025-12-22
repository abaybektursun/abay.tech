# Public Chat Sharing - Implementation Plan

## Design

**Separate `shares` table** instead of a GSI on the chats table.

```
Table: shares
PK: chatId (string)
Attributes: userId, createdAt
```

Why this is better:
- **No hot partition**: GSI with `visibility="public"` as hash key would funnel all public chats to one partition
- **O(1) lookup**: Direct key lookup, no query needed
- **No migration**: Shares only exist when explicitly created
- **Clean separation**: Sharing logic isolated from chat storage
- **Easy revoke**: Delete the share record

## Flow

**Share a chat:**
1. User clicks "Share" button
2. Insert `{ chatId, userId, createdAt }` into `shares` table
3. Return share URL: `/share/{chatId}`

**View shared chat:**
1. GET `/share/{chatId}`
2. Lookup `shares` table by `chatId`
3. If not found → 404
4. Fetch full chat from `chats` table using `userId + chatId`
5. Render read-only view

**Unshare:**
1. Delete record from `shares` table

---

## Files

### New Files

| File | Purpose |
|------|---------|
| `src/lib/shares.ts` | Share/unshare server actions |
| `src/app/share/[id]/page.tsx` | Public share page |
| `src/components/growth-tools/shared-chat-view.tsx` | Read-only chat view |

### Modified Files

| File | Changes |
|------|---------|
| `sst.config.ts` | Add `shares` table |
| `src/components/growth-tools/GrowthToolChat.tsx` | Add share button |

---

## Implementation

### 1. Infrastructure (`sst.config.ts`)

```typescript
const sharesTable = new sst.aws.Dynamo("Shares", {
  fields: {
    chatId: "string",
  },
  primaryIndex: { hashKey: "chatId" },
});
```

### 2. Server Actions (`src/lib/shares.ts`)

```typescript
'use server'

export async function shareChat(chatId: string, userId: string): Promise<string>
export async function unshareChat(chatId: string, userId: string): Promise<void>
export async function getSharedChat(chatId: string): Promise<Chat | null>
export async function isShared(chatId: string): Promise<boolean>
```

### 3. Share Page (`src/app/share/[id]/page.tsx`)

```typescript
export default async function SharePage({ params }: { params: { id: string } }) {
  const chat = await getSharedChat(params.id);
  if (!chat) notFound();
  return <SharedChatView chat={chat} />;
}
```

Next.js App Router caches server components by default. Add `revalidate` if needed.

### 4. Shared Chat View

Extract read-only rendering from `GrowthToolChat.tsx`:
- Reuse: `Conversation`, `Message`, `MessageContent`, `MessageResponse`
- Reuse: Tool renderers (LifeWheel, sliders as static)
- Remove: Input, voice controls, mutations

### 5. Share Button in Chat

```typescript
// In GrowthToolChat header
{isAuthenticated && messages.length > 0 && (
  <ShareButton chatId={chatId} isShared={isShared} />
)}
```

Simple button that:
- Shows "Share" or "Shared ✓" state
- Copies link to clipboard on share
- Confirms before unsharing

---

## Security

- `shareChat`: Verify `userId` owns the chat before creating share
- `unshareChat`: Verify `userId` owns the chat before deleting
- `getSharedChat`: Public, no auth needed
- Rate limiting: Use existing middleware

---

## Testing

- [ ] Share creates record, returns URL
- [ ] Shared chat viewable without auth
- [ ] Unshare removes access
- [ ] Non-owner cannot share/unshare
- [ ] Tool outputs render correctly

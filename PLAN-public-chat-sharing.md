# Public Chat Sharing Feature - Implementation Plan

## Overview

Enable registered users to share their chat conversations publicly via a URL. This follows the **canonical Vercel Chat SDK pattern** using the `visibility` field approach, adapted for DynamoDB.

## Research Sources

- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [AI Elements Components](https://ai-sdk.dev/elements) - 31 pre-built components
- [Chat SDK Documentation](https://chat-sdk.dev/)
- [Vercel ai-chatbot Repository](https://github.com/vercel/ai-chatbot) - Reference implementation
- [PR #662: Visibility Feature](https://github.com/vercel/ai-chatbot/pull/662)
- [PR #665: Documents in Public Chats](https://github.com/vercel/ai-chatbot/pull/665)

## Architecture Design

### Database Schema Changes

**Current Schema** (DynamoDB `chats` table):
```
PK: userId (string)
SK: id (string)
Attributes: title, exerciseId, createdAt, path, messages, pinned
```

**New Schema** - Add visibility field:
```
PK: userId (string)
SK: id (string)
Attributes:
  + visibility: "private" | "public" (default: "private")
  ... existing attributes
```

**New GSI** - For public chat lookup without knowing userId:
```
GSI Name: PublicChatIndex
PK: visibility (string) - Only index "public" chats
SK: id (string)
Projection: ALL
```

This GSI allows fetching a public chat by just `id` without requiring `userId`.

### URL Structure

Following Chat SDK pattern:
- **Private chat**: `/apps/growth-tools/{exerciseId}/{chatId}` (requires auth, owner only)
- **Public chat**: `/share/{chatId}` (public access, read-only)

### Access Control Matrix

| Visibility | Owner | Authenticated Non-owner | Anonymous |
|------------|-------|------------------------|-----------|
| private    | Full access | 404 | 404 |
| public     | Full access | Read-only | Read-only |

---

## Implementation Components

### 1. Database Layer (`/src/lib/actions.ts`)

```typescript
// New type
export type VisibilityType = 'private' | 'public';

// New function: Update chat visibility
export async function updateChatVisibility({
  chatId,
  userId,
  visibility,
}: {
  chatId: string;
  userId: string;
  visibility: VisibilityType;
}): Promise<void>

// New function: Get public chat by ID (uses GSI)
export async function getPublicChat(chatId: string): Promise<Chat | null>

// Modify: saveChat to include visibility
export async function saveChat(chat: {
  id: string;
  messages: UIMessage[];
  userId: string;
  exerciseId: string;
  visibility?: VisibilityType; // default: 'private'
})
```

### 2. SST Infrastructure (`/sst.config.ts`)

Add GSI to the chats table:

```typescript
const chatTable = new sst.aws.Dynamo("Chats", {
  fields: {
    userId: "string",
    id: "string",
    visibility: "string", // New field
  },
  primaryIndex: { hashKey: "userId", rangeKey: "id" },
  globalIndexes: {
    PublicChatIndex: {
      hashKey: "visibility",
      rangeKey: "id",
    },
  },
});
```

### 3. Visibility Selector Component

**File**: `/src/components/growth-tools/visibility-selector.tsx`

Following Chat SDK pattern exactly:
- Dropdown menu with Lock/Globe icons
- Shows "Private" (default) or "Public" options
- Calls `updateChatVisibility` server action on change
- Uses `useChatVisibility` hook for state management

```typescript
interface VisibilitySelectorProps {
  chatId: string;
  className?: string;
  selectedVisibilityType: VisibilityType;
}
```

### 4. Chat Visibility Hook

**File**: `/src/hooks/use-chat-visibility.ts`

```typescript
export function useChatVisibility({
  chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
}) {
  // Local state with SWR
  // Optimistic updates
  // Server action call for persistence
  return {
    visibilityType,
    setVisibilityType,
  };
}
```

### 5. Public Share Page

**File**: `/src/app/share/[id]/page.tsx`

Server component that:
1. Fetches chat via `getPublicChat(id)` using GSI
2. Returns 404 if not found or not public
3. Renders read-only chat view using AI Elements
4. Shows exercise context and metadata

```typescript
export default async function SharePage({ params }: { params: { id: string } }) {
  const chat = await getPublicChat(params.id);

  if (!chat || chat.visibility !== 'public') {
    notFound();
  }

  return <SharedChatView chat={chat} />;
}
```

### 6. Shared Chat View Component

**File**: `/src/components/growth-tools/shared-chat-view.tsx`

Read-only version of `GrowthToolChat`:
- Reuses AI Elements: `Conversation`, `Message`, `MessageContent`, `MessageResponse`
- No input area (PromptInput)
- No voice recording/playback controls
- Shows "Shared by [username]" header
- Copy link button
- Tool outputs (LifeWheel, sliders) render as static displays

### 7. Share Button Integration

Add to existing `GrowthToolChat.tsx`:

```typescript
// In the chat header area
{isAuthenticated && (
  <VisibilitySelector
    chatId={chatId}
    selectedVisibilityType={visibility}
  />
)}
```

### 8. Copy Share Link Feature

When visibility is "public", show copy button:
```typescript
const shareUrl = `${window.location.origin}/share/${chatId}`;
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `/src/components/growth-tools/visibility-selector.tsx` | Visibility toggle dropdown |
| `/src/components/growth-tools/shared-chat-view.tsx` | Read-only chat display |
| `/src/hooks/use-chat-visibility.ts` | Visibility state management |
| `/src/app/share/[id]/page.tsx` | Public share route |
| `/src/app/share/[id]/loading.tsx` | Loading state |
| `/src/app/share/[id]/not-found.tsx` | 404 page |

### Modified Files
| File | Changes |
|------|---------|
| `/sst.config.ts` | Add GSI for public chats |
| `/src/lib/actions.ts` | Add visibility functions |
| `/src/components/growth-tools/GrowthToolChat.tsx` | Add visibility selector |

---

## Implementation Order

1. **Phase 1: Database**
   - Add `visibility` field to schema
   - Add GSI to SST config
   - Deploy infrastructure changes

2. **Phase 2: Server Actions**
   - Add `updateChatVisibility` action
   - Add `getPublicChat` function
   - Modify `saveChat` to handle visibility

3. **Phase 3: Visibility Hook & Component**
   - Create `useChatVisibility` hook
   - Create `VisibilitySelector` component
   - Install via AI Elements pattern

4. **Phase 4: Public Share Page**
   - Create `/share/[id]` route
   - Create `SharedChatView` component
   - Handle edge cases (404, loading)

5. **Phase 5: Integration**
   - Add VisibilitySelector to GrowthToolChat
   - Add share link copy functionality
   - Test end-to-end flow

---

## Security Considerations

1. **Authentication Required for Visibility Toggle**: Only chat owner can change visibility
2. **Server-side Validation**: Always verify ownership before updating visibility
3. **GSI Query Optimization**: Only index "public" chats to minimize storage/cost
4. **Rate Limiting**: Apply existing rate limits to public share page
5. **No Message Editing on Public View**: Strictly read-only

---

## Technical Patterns to Follow

### From Vercel Chat SDK

1. **Optimistic Updates**: Update UI immediately, then sync to server
2. **SWR Integration**: Cache chat visibility state
3. **Server Actions**: Use Next.js server actions for mutations
4. **Composite Key Design**: Maintain DynamoDB best practices

### From AI Elements

1. **Component Installation**: Use `npx ai-elements@latest add <component>` for any missing components
2. **Customization**: Components are copied to codebase for full control
3. **Streaming Support**: Components handle streaming responses natively

---

## Testing Checklist

- [ ] Owner can toggle visibility private → public
- [ ] Owner can toggle visibility public → private
- [ ] Public chat accessible at `/share/{id}` without auth
- [ ] Private chat returns 404 at `/share/{id}`
- [ ] Non-owner authenticated users get read-only view
- [ ] Anonymous users get read-only view
- [ ] Copy share link works correctly
- [ ] Tool outputs (LifeWheel) render on public view
- [ ] Loading states work correctly
- [ ] Error states handled gracefully

---

## Out of Scope (Future Enhancements)

- Sharing with specific users (invite links)
- Expiring share links
- View count analytics
- Social sharing metadata (OG tags)
- Embedding chat in external sites

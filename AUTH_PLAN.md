# Authentication & Data Migration Plan

This document outlines the detailed plan for integrating simple third-party authentication and migrating anonymous user chat data to a persistent database record upon sign-in. It adheres strictly to the "Keep It Simple, Stupid" (KISS) principle and enforces **strict isolation** to the `/apps` route.

**Status:** ✅ COMPLETE. All phases implemented and build passing.

---

### **Objective:**
Integrate a simple, third-party authentication system. Allow anonymous users to use the chat and store their data locally. When they login with their social account, seamlessly migrate their local data to the database, associating it with their user profile.

### **Core Principle 1: KISS (Keep It Simple, Stupid)**
-   Use Auth.js (NextAuth v5) for all auth logic.
-   Use `localStorage` for anonymous data.
-   Use Google/GitHub providers.

### **Core Principle 2: Strict Isolation**
-   **Do NOT touch the root layout (`src/app/layout.tsx`).**
-   **Do NOT touch global styles (`tailwind.config.ts`, `globals.css`).**
-   Authentication must be scoped entirely within `src/app/apps/`.

---

#### **Phase 1: User Experience (The Flow)**

**Scenario A: The First-Time / Returning Anonymous User**
1.  **Arrival:** User lands on the chat page (`/apps/growth-tools`). No login prompts.
2.  **Interaction:** User starts a new chat or resumes a previous one.
3.  **Automatic Local Save:** Each message (user and AI) is silently saved to `localStorage`. Multiple chats are supported.
4.  **Persistence:** If the user closes the tab and returns, the `NeedsAssessmentView` component loads the conversation from `localStorage`, resuming the session.
    *   **Experience Goal:** Effortless local persistence without requiring user action.

**Scenario B: The Anonymous User Signs Up (Data Migration)**
1.  **Decision:** User, with active chats in `localStorage`, decides to sign up/in via a button *inside the apps area*.
2.  **Auth Flow:** User is presented with "Continue with Google" or "Continue with GitHub" options. They complete the standard OAuth flow.
3.  **Redirection:** User is redirected back to the application, now in an authenticated state.
4.  **Migration Logic:**
    *   Client detects user is now authenticated.
    *   **If user already has existing chats in DynamoDB:** Disregard localStorage data. Clear it silently.
    *   **If user has NO chats in DynamoDB (fresh account):** Migrate localStorage chats to DynamoDB, then clear localStorage.
    *   **Experience Goal:** Seamless transition. Returning users keep their DB data; new users get their local data migrated.

**Scenario C: The Returning Authenticated User**
1.  **Arrival:** User visits the site. Auth.js automatically restores their session.
2.  **Data Fetching:** The UI displays their logged-in status. The `getChats` server action is called, fetching their *entire* chat history from DynamoDB.
3.  **Interaction:** The sidebar (`growth-tools/page.tsx:68-99`) populates with their saved chats. `localStorage` is **not used** for authenticated users. New chats are saved directly to DynamoDB via the existing `saveChat` action.
    *   **Experience Goal:** Consistent and reliable access to their data across sessions and devices.

---

#### **Phase 2: Data Contracts**

**localStorage Schema:**
```typescript
// Key: "growth-tools-chats"
// Value: JSON stringified array
interface LocalChat {
  id: string;          // Generated via nanoid() client-side
  title: string;       // First message content, truncated to 100 chars
  createdAt: number;   // Date.now()
  messages: Message[]; // The full message array from useChat
}

type LocalChats = LocalChat[];
```

**DynamoDB Schema:** (Already exists in `actions.ts`)
- Partition key: `userId`
- Sort key: `id` (generated via `nanoid()` server-side)
- Attributes: `title`, `createdAt`, `path`, `messages` (JSON stringified)

---

#### **Phase 3: Implementation Steps**

1.  **Auth.js Foundation:** ✅
    *   Install `next-auth@beta`.
    *   Create `src/auth.ts` (Providers: Google, GitHub).
    *   Create `src/app/api/auth/[...nextauth]/route.ts` (Auth.js catch-all API route).

2.  **Scoped Session Provider:** ✅
    *   Modify `src/app/apps/layout.tsx` to wrap children in `<SessionProvider>`.
    *   **Verification:** `src/app/layout.tsx` remains untouched.

3.  **Scoped UI:** ✅
    *   Create `src/components/auth/auth-button.tsx`.
    *   Place `AuthButton` inside `src/app/apps/layout.tsx`, positioned top-right with z-50.

4.  **localStorage Logic:** ✅
    *   Created `src/lib/growth-tools/local-storage.ts` with helpers: `getLocalChats`, `saveLocalChat`, `getLocalChat`, `deleteLocalChat`, `clearLocalChats`.
    *   On component mount (anonymous): Load chats from localStorage.
    *   On messages change (anonymous): Save chat to localStorage via useEffect.
    *   Update sidebar in `growth-tools/page.tsx` to read from localStorage when anonymous.

5.  **Migration Logic:** ✅
    *   Created `migrateChats` server action in `src/lib/actions.ts` (batch save with 25 item DynamoDB limit).
    *   In `NeedsAssessmentView.tsx`: When session becomes valid:
        1. Call `getChats(userId)`.
        2. If chats exist in DB → clear localStorage, done.
        3. If no chats in DB → call `migrateChats`, then clear localStorage.

6.  **Sidebar Integration:** ✅
    *   Updated `growth-tools/page.tsx` sidebar to call `getChats()` for authenticated users and `getLocalChats()` for anonymous users.

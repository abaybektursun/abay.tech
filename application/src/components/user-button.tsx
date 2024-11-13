// src/components/user-button.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function UserButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">
        {session.user?.name || session.user?.email}
      </span>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
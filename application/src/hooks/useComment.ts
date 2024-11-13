// src/hooks/useComment.ts
"use client";

import type { Comment } from "@/interfaces";
import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} while fetching: ${url}`);
    }
    return res.json();
  });

async function getAccessToken(): Promise<string | null> {
  const res = await fetch("/api/auth/session");
  const session = await res.json();
  return session?.accessToken || null;
}

// Changed from export default to export const
export const useComments = () => {
  const { data: session } = useSession();
  const [text, setText] = useState("");

  const { data: comments, mutate } = useSWR<Comment[]>("/api/comment", fetcher, {
    fallbackData: [],
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      console.warn("User not authenticated.");
      return;
    }

    const token = await getAccessToken();

    if (!token) {
      console.error("Failed to retrieve access token.");
      return;
    }

    try {
      await fetch("/api/comment", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setText("");
      await mutate();
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const onDelete = async (comment: Comment) => {
    if (!session) {
      console.warn("User not authenticated.");
      return;
    }

    const token = await getAccessToken();

    if (!token) {
      console.error("Failed to retrieve access token.");
      return;
    }

    try {
      await fetch("/api/comment", {
        method: "DELETE",
        body: JSON.stringify({ comment }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await mutate();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return {
    text,
    setText,
    comments,
    onSubmit,
    onDelete,
    isAuthenticated: !!session,
  };
};

// Add this line to make it the default export as well
export default useComments;
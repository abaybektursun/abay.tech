// src/components/comment/index.tsx
"use client";  // Add this line since you're using hooks

import CommentForm from "./form";
import CommentList from "./list";
import { useComments } from "../../hooks/useComment";  // Use named import

export default function Comment() {
  const { text, setText, comments, onSubmit, onDelete } = useComments();

  return (
    <div className="mt-20">
      <CommentForm onSubmit={onSubmit} text={text} setText={setText} />
      <CommentList comments={comments} onDelete={onDelete} />
    </div>
  );
}
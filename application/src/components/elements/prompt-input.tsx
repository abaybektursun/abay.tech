"use client";

import type {
  ComponentProps,
  HTMLAttributes,
  KeyboardEventHandler,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type PromptInputProps = HTMLAttributes<HTMLFormElement>;

export const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      "w-full overflow-hidden rounded-lg border bg-background shadow-sm",
      className
    )}
    {...props}
  />
);

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = "Send a message...",
  minHeight = 40,
  maxHeight = 200,
  ...props
}: PromptInputTextareaProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.shiftKey) {
        return;
      }

      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Textarea
      className={cn(
        "w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0",
        "bg-transparent placeholder:text-muted-foreground/50",
        "focus-visible:ring-0 focus-visible:ring-offset-0",
        "min-h-[40px] max-h-[200px]",
        className
      )}
      name="message"
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputToolbar = ({
  className,
  ...props
}: PromptInputToolbarProps) => (
  <div
    className={cn(
      "flex items-center justify-between border-t px-3 py-2",
      className
    )}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props} />
);

export type PromptInputSubmitProps = HTMLAttributes<HTMLButtonElement>;

export const PromptInputSubmit = ({
  className,
  disabled,
  children,
  ...props
}: PromptInputSubmitProps) => (
  <button
    type="submit"
    disabled={disabled}
    className={cn(
      "flex size-8 items-center justify-center rounded-md transition-all",
      disabled
        ? "bg-muted text-muted-foreground cursor-not-allowed"
        : "bg-primary text-primary-foreground hover:bg-primary/90",
      className
    )}
    {...props}
  >
    {children}
  </button>
);
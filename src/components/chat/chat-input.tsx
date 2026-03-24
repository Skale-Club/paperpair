"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  isStreaming?: boolean;
  onSendMessage?: (content: string) => void;
  onStop?: () => void;
};

export function ChatInput({
  isLoading,
  disabled,
  isStreaming = false,
  onSendMessage,
  onStop,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    if (onSendMessage) {
      onSendMessage(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your answer or 'generate pdf'"
        disabled={isLoading}
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
      />
      {isStreaming ? (
        <Button
          type="button"
          onClick={onStop}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Stop
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={disabled || input.trim().length === 0}
          className="bg-black text-white hover:bg-zinc-800"
        >
          {isLoading ? "..." : "Send"}
        </Button>
      )}
    </form>
  );
}

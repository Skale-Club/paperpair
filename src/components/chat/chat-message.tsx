"use client";

import type { Message } from "./types";

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`max-w-[90%] rounded px-3 py-2 text-sm ${
        isAssistant
          ? "bg-slate-100 text-slate-800"
          : "ml-auto bg-black text-white"
      }`}
    >
      {message.content}
    </div>
  );
}

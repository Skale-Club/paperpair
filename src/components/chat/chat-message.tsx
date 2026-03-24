"use client";

import type { Message } from "./types";

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  // Extract text content from message (supports both legacy format and UIMessage parts)
  const textContent =
    message.content ||
    (message as { parts?: Array<{ type: string; text?: string }> }).parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("") ||
    "";

  return (
    <div
      className={`max-w-[90%] rounded px-3 py-2 text-sm ${
        isAssistant ? "bg-slate-100 text-slate-800" : "ml-auto bg-black text-white"
      }`}
    >
      {textContent.split("\n").map((line, i) => (
        <span key={i}>
          {line}
          {i < textContent.split("\n").length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import type { Message } from "./types";

type ChatPanelProps = {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  canSend: boolean;
};

export function ChatPanel({
  isOpen,
  onToggle,
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  canSend
}: ChatPanelProps) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Intake chat</p>
            <button
              className="text-xs text-slate-600 underline"
              onClick={onToggle}
              type="button"
            >
              Close
            </button>
          </div>
          <div className="h-[320px] space-y-3 overflow-y-auto rounded border border-slate-200 p-3">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
          <ChatInput
            value={input}
            onChange={onInputChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
            disabled={!canSend}
          />
        </div>
      )}
      <Button
        onClick={onToggle}
        className="bg-black text-white hover:bg-zinc-800 shadow-lg"
      >
        {isOpen ? "Hide chat" : "Open chat"}
      </Button>
    </div>
  );
}

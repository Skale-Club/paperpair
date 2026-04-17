"use client";

import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import type { Message } from "./types";
import { chatModels } from "@/lib/ai/models";

type ChatPanelProps = {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  canSend: boolean;
  status?: "submitted" | "streaming" | "ready" | "error";
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  onSendMessage?: (content: string) => void;
  onStop?: () => void;
  onRegenerate?: () => void;
};

export function ChatPanel({
  isOpen,
  onToggle,
  messages,
  isLoading,
  canSend,
  status = "ready",
  selectedModelId,
  onModelChange,
  onSendMessage,
  onStop,
}: ChatPanelProps) {
  const isStreaming = status === "streaming";

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-black">Intake chat</p>
              {isStreaming && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Streaming...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedModelId && onModelChange && (
                <select
                  value={selectedModelId}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                >
                  {chatModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="text-xs text-slate-600 underline"
                onClick={onToggle}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
          <div className="h-[320px] space-y-3 overflow-y-auto rounded border border-slate-200 p-3">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span>Thinking...</span>
              </div>
            )}
          </div>
          <ChatInput
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
            isLoading={isLoading}
            disabled={!canSend}
            isStreaming={isStreaming}
            onSendMessage={onSendMessage}
            onStop={onStop}
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

"use client";

import { ChatContainer } from "./chat";
import type { Template } from "./chat/types";

type ChatUIProps = {
  templates: Template[];
  initialSelectedTemplateKeys: string[];
  initialMessages?: Array<{ id: string; role: "user" | "assistant"; content: string }>;
};

export function ChatUI({ templates, initialSelectedTemplateKeys, initialMessages = [] }: ChatUIProps) {
  return (
    <ChatContainer
      templates={templates}
      initialSelectedTemplateKeys={initialSelectedTemplateKeys}
      initialMessages={initialMessages}
    />
  );
}

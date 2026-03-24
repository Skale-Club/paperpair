"use client";

import { ChatContainer } from "./chat";
import type { Template } from "./chat/types";

type ChatUIProps = {
  templates: Template[];
  initialSelectedTemplateKeys: string[];
};

export function ChatUI({ templates, initialSelectedTemplateKeys }: ChatUIProps) {
  return (
    <ChatContainer
      templates={templates}
      initialSelectedTemplateKeys={initialSelectedTemplateKeys}
    />
  );
}

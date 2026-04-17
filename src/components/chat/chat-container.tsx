"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PdfViewer } from "./pdf-viewer";
import { ChatPanel } from "./chat-panel";
import { IntakeSummary } from "./intake-summary";
import { GeneratedFilesList } from "./generated-files-list";
import { TemplateSelector } from "./template-selector";
import type { Template, ChatMessage, StructuredData } from "./types";
import { emptyStructuredData, requiredFields } from "./types";

function sanitizeSelectedTemplateKeys(rawKeys: string[], templates: Template[]): string[] {
  const allowedKeys = new Set(templates.map((t) => t.key));
  return Array.from(new Set(rawKeys.map((k) => k.trim()).filter((k) => k && allowedKeys.has(k))));
}

function buildTemplateSelectionUrl(keys: string[]): string {
  const params = new URLSearchParams();
  keys.forEach((k) => params.append("template", k));
  const query = params.toString();
  return query
    ? `/documentation-filling/select-templates?${query}`
    : "/documentation-filling/select-templates";
}

function extractStructuredData(messages: Array<{ role: string; content: string }>): StructuredData {
  const data = emptyStructuredData();
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  // Extract email
  const emailMatch = userText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  if (emailMatch) data.email = emailMatch[0];

  // Extract phone
  const phoneMatch = userText.match(/(?:\+1\s?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/);
  if (phoneMatch) data.phone = phoneMatch[0];

  // Extract dates (MM/DD/YYYY format)
  const dateMatches = userText.match(/\d{1,2}\/\d{1,2}\/\d{4}/g);
  if (dateMatches) {
    if (dateMatches.length === 1) {
      data.marriageDate = dateMatches[0];
    } else if (dateMatches.length === 2) {
      data.dateOfBirth = dateMatches[0];
      data.marriageDate = dateMatches[1];
    } else if (dateMatches.length >= 3) {
      data.dateOfBirth = dateMatches[0];
      data.marriageDate = dateMatches[1];
      data.entryDateUsa = dateMatches[2];
    }
  }

  // Extract I-94 (9 or 10 digit number)
  const i94Match = userText.match(/(?:i[-\s]?94[:\s]*)?(\d{9,10})/i);
  if (i94Match) data.i94Number = i94Match[1];

  return data;
}

function isGenerateIntent(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("gerar pdf") ||
    normalized.includes("generate pdf") ||
    normalized.includes("finalizar")
  );
}

type ChatContainerProps = {
  templates: Template[];
  initialSelectedTemplateKeys: string[];
  initialMessages?: Array<{ id: string; role: "user" | "assistant"; content: string }>;
};

export function ChatContainer({ templates, initialSelectedTemplateKeys, initialMessages = [] }: ChatContainerProps) {
  const initialKeys = sanitizeSelectedTemplateKeys(initialSelectedTemplateKeys, templates);
  const initialViewerUrl = templates.find((t) => initialKeys.includes(t.key))?.filePath ?? null;

  const [extractedData, setExtractedData] = useState<StructuredData>(emptyStructuredData());
  const [generatedFiles] = useState<Array<{ key: string; url: string }>>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<string[]>(initialKeys);
  const [viewerUrl, setViewerUrl] = useState<string | null>(initialViewerUrl);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState("google/gemini-2.0-flash");
  const objectUrlRef = useRef<string | null>(null);
  const extractedRef = useRef<StructuredData>(emptyStructuredData());

  // Convert plain DB messages to UIMessage format required by useChat — per D-13
  const seedMessages = useMemo<ChatMessage[]>(
    () =>
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text" as const, text: m.content }],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // only seed on initial mount; do not re-derive from prop changes
  );

  const { messages, setMessages, sendMessage, status, stop, regenerate } = useChat<ChatMessage>({
    id: "paperpair-intake",
    generateId: () => crypto.randomUUID(),
    messages: seedMessages, // initialMessages from DB, per D-13 CHAT-04
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest(request) {
        return {
          body: {
            messages: request.messages,
            selectedModelId,
            selectedTemplateKeys,
          },
        };
      },
    }),
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Track extracted data from conversation
  useEffect(() => {
    if (messages.length > 0) {
      const simpleMessages = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role,
          content:
            m.parts
              ?.filter((p) => p.type === "text")
              .map((p) => ("text" in p ? p.text : ""))
              .join("") ?? "",
        }));

      const heuristicData = extractStructuredData(simpleMessages);
      // Only update if we got new data
      const hasNewData = requiredFields.some(
        (field) => heuristicData[field] && heuristicData[field] !== extractedRef.current[field]
      );

      if (hasNewData) {
        extractedRef.current = heuristicData;
        setExtractedData(heuristicData);
      }
    }
  }, [messages]);

  // Handle file upload / generated files
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (uploadedPdfUrl) {
      setViewerUrl(uploadedPdfUrl);
      return;
    }
    if (generatedFiles.length > 0) {
      setViewerUrl(generatedFiles[0].url);
      return;
    }
    const firstSelected = templates.find((t) => selectedTemplateKeys.includes(t.key));
    setViewerUrl(firstSelected?.filePath ?? null);
  }, [uploadedPdfUrl, generatedFiles, selectedTemplateKeys, templates]);

  const canSend = useMemo(() => status !== "streaming" && status !== "submitted", [status]);
  const templateSelectionUrl = useMemo(
    () => buildTemplateSelectionUrl(selectedTemplateKeys),
    [selectedTemplateKeys]
  );

  const handleFileSelect = useCallback((file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setUploadedPdfUrl(url);
  }, []);

  const handleStartFilling = useCallback(() => {
    setIsChatOpen(true);
    // Send initial message to start intake
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: "I'd like to start filling my documents. I'm doing a marriage-based Adjustment of Status." }],
    });
  }, [sendMessage]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      if (isGenerateIntent(trimmed) && !selectedTemplateKeys.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "Select at least one document before generating the package PDFs.",
              },
            ],
          },
        ]);
        return;
      }

      // Use AI SDK sendMessage for streaming
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: trimmed }],
      });

      // Auto-open chat when assistant responds
      setIsChatOpen(true);
    },
    [sendMessage, selectedTemplateKeys, setMessages]
  );

  const handleToggleTemplate = useCallback((key: string) => {
    setSelectedTemplateKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSelectAllTemplates = useCallback(() => {
    setSelectedTemplateKeys(templates.map((t) => t.key));
  }, [templates]);

  const handleGenerate = useCallback(() => {
    handleSendMessage("generate pdf");
  }, [handleSendMessage]);

  // Convert AI SDK messages to legacy format for ChatPanel
  const legacyMessages = useMemo(() => {
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content:
          m.parts
            ?.filter((p) => p.type === "text")
            .map((p) => ("text" in p ? p.text : ""))
            .join("") ?? "",
      }));
  }, [messages]);

  // Handle model change
  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_1fr]">
        <PdfViewer
          viewerUrl={viewerUrl}
          uploadedPdfUrl={uploadedPdfUrl}
          templates={templates}
          templateSelectionUrl={templateSelectionUrl}
          onStartFilling={handleStartFilling}
          onFileSelect={handleFileSelect}
          isLoading={status === "streaming" || status === "submitted"}
        />

        <aside className="space-y-4 h-fit">
          <IntakeSummary extractedData={extractedData} />
          <GeneratedFilesList files={generatedFiles} />
          <TemplateSelector
            templates={templates}
            selectedKeys={selectedTemplateKeys}
            onToggle={handleToggleTemplate}
            onSelectAll={handleSelectAllTemplates}
            onGenerate={handleGenerate}
            isLoading={status === "streaming" || status === "submitted"}
          />
        </aside>
      </div>

      <ChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
        messages={legacyMessages}
        input=""
        onInputChange={() => {}}
        onSubmit={() => {}}
        isLoading={status === "streaming" || status === "submitted"}
        canSend={canSend}
        status={status}
        selectedModelId={selectedModelId}
        onModelChange={handleModelChange}
        onSendMessage={handleSendMessage}
        onStop={stop}
        onRegenerate={regenerate}
      />
    </div>
  );
}

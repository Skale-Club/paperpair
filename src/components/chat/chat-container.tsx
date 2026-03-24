"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PdfViewer } from "./pdf-viewer";
import { ChatPanel } from "./chat-panel";
import { IntakeSummary } from "./intake-summary";
import { GeneratedFilesList, buildDocumentsPageUrl } from "./generated-files-list";
import { TemplateSelector } from "./template-selector";
import type { Message, Template, ChatResponse } from "./types";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'll collect the couple's details for marriage-based Adjustment of Status. To start, what's the beneficiary's full name?"
};

function sanitizeSelectedTemplateKeys(
  rawKeys: string[],
  templates: Template[]
): string[] {
  const allowedKeys = new Set(templates.map((t) => t.key));
  return Array.from(
    new Set(rawKeys.map((k) => k.trim()).filter((k) => k && allowedKeys.has(k)))
  );
}

function isGenerateIntent(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("gerar pdf") ||
    normalized.includes("generate pdf") ||
    normalized.includes("finalizar")
  );
}

function buildTemplateSelectionUrl(keys: string[]): string {
  const params = new URLSearchParams();
  keys.forEach((k) => params.append("template", k));
  const query = params.toString();
  return query
    ? `/documentation-filling/select-templates?${query}`
    : "/documentation-filling/select-templates";
}

type ChatContainerProps = {
  templates: Template[];
  initialSelectedTemplateKeys: string[];
};

export function ChatContainer({
  templates,
  initialSelectedTemplateKeys
}: ChatContainerProps) {
  const initialKeys = sanitizeSelectedTemplateKeys(initialSelectedTemplateKeys, templates);
  const initialViewerUrl =
    templates.find((t) => initialKeys.includes(t.key))?.filePath ?? null;

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [generatedFiles, setGeneratedFiles] = useState<Array<{ key: string; url: string }>>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<string[]>(initialKeys);
  const [viewerUrl, setViewerUrl] = useState<string | null>(initialViewerUrl);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
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

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);
  const selectedTemplates = useMemo(
    () => templates.filter((t) => selectedTemplateKeys.includes(t.key)),
    [templates, selectedTemplateKeys]
  );
  const templateSelectionUrl = useMemo(
    () => buildTemplateSelectionUrl(selectedTemplateKeys),
    [selectedTemplateKeys]
  );

  const handleFileSelect = useCallback((file: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setUploadedPdfUrl(url);
  }, []);

  const handleStartFilling = useCallback(() => {
    setIsChatOpen(true);
    setMessages([
      {
        role: "assistant",
        content:
          "I'm starting to fill your document. I need a few details. What's the beneficiary's full name?"
      }
    ]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    if (isGenerateIntent(trimmed) && !selectedTemplateKeys.length) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Select at least one document before generating the package PDFs."
        }
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          selectedTemplateKeys
        })
      });

      setIsLoading(false);

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Couldn't process now. Please try again." }
        ]);
        return;
      }

      const data: ChatResponse = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setExtractedData(data.extractedData ?? {});
      setGeneratedFiles(data.generatedFiles ?? []);

      if (data.reply.includes("?")) {
        setIsChatOpen(true);
      }
    } catch {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred. Please try again." }
      ]);
    }
  }, [isLoading, messages, selectedTemplateKeys]);

  const handleSubmit = useCallback(() => {
    if (canSend) sendMessage(input);
  }, [canSend, input, sendMessage]);

  const handleToggleTemplate = useCallback((key: string) => {
    setSelectedTemplateKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSelectAllTemplates = useCallback(() => {
    setSelectedTemplateKeys(templates.map((t) => t.key));
  }, [templates]);

  const handleGenerate = useCallback(() => {
    sendMessage("generate pdf");
  }, [sendMessage]);

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
          isLoading={isLoading}
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
            isLoading={isLoading}
          />
        </aside>
      </div>

      <ChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        canSend={canSend}
      />
    </div>
  );
}

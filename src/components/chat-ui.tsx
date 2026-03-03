"use client";

import Link from "next/link";
import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  reply: string;
  extractedData: Record<string, string>;
  generatedFiles?: Array<{ key: string; url: string }>;
};

type Template = {
  id: string;
  key: string;
  name: string;
  filePath: string;
};

function sanitizeSelectedTemplateKeys(
  rawKeys: string[],
  templates: Template[]
) {
  const allowedKeys = new Set(templates.map((template) => template.key));
  return Array.from(
    new Set(rawKeys.map((key) => key.trim()).filter((key) => key && allowedKeys.has(key)))
  );
}

const structuredFieldLabels: Record<string, string> = {
  fullName: "Beneficiary full name",
  dateOfBirth: "Date of birth",
  email: "Email",
  phone: "Phone",
  currentAddress: "Current address",
  spouseFullName: "Petitioning spouse name",
  marriageDate: "Marriage date",
  entryDateUsa: "U.S. entry date",
  i94Number: "I-94 number"
};

function isGenerateIntent(text: string) {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("gerar pdf") ||
    normalized.includes("generate pdf") ||
    normalized.includes("finalizar")
  );
}

function buildDocumentsPageUrl(
  files: Array<{ key: string; url: string }>,
  focus?: string
) {
  const params = new URLSearchParams();
  files.forEach((file) => params.append("file", file.url));
  if (focus) params.set("focus", focus);
  const query = params.toString();
  return query
    ? `/documentation-filling/documents?${query}`
    : "/documentation-filling/documents";
}

function buildTemplateSelectionUrl(selectedTemplateKeys: string[]) {
  const params = new URLSearchParams();
  selectedTemplateKeys.forEach((key) => params.append("template", key));
  const query = params.toString();
  return query
    ? `/documentation-filling/select-templates?${query}`
    : "/documentation-filling/select-templates";
}

export function ChatUI({
  templates,
  initialSelectedTemplateKeys
}: {
  templates: Template[];
  initialSelectedTemplateKeys: string[];
}) {
  const initialSelectedKeys = sanitizeSelectedTemplateKeys(initialSelectedTemplateKeys, templates);
  const initialViewerUrl =
    templates.find((template) => initialSelectedKeys.includes(template.key))?.filePath ?? null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'll collect the couple's details for marriage-based Adjustment of Status. To start, what's the beneficiary's full name?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [generatedFiles, setGeneratedFiles] = useState<Array<{ key: string; url: string }>>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<string[]>(initialSelectedKeys);
  const [viewerUrl, setViewerUrl] = useState<string | null>(initialViewerUrl);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

    const firstSelectedTemplate = templates.find((template) =>
      selectedTemplateKeys.includes(template.key)
    );
    setViewerUrl(firstSelectedTemplate?.filePath ?? null);
  }, [uploadedPdfUrl, generatedFiles, selectedTemplateKeys, templates]);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);
  const selectedTemplates = useMemo(
    () => templates.filter((template) => selectedTemplateKeys.includes(template.key)),
    [templates, selectedTemplateKeys]
  );
  const extractedEntries = useMemo(
    () =>
      Object.entries(extractedData).filter(([, value]) => String(value).trim().length > 0),
    [extractedData]
  );
  const extractionProgress = `${extractedEntries.length}/${Object.keys(structuredFieldLabels).length}`;
  const documentsHubUrl = useMemo(
    () => buildDocumentsPageUrl(generatedFiles),
    [generatedFiles]
  );
  const templateSelectionUrl = useMemo(
    () => buildTemplateSelectionUrl(selectedTemplateKeys),
    [selectedTemplateKeys]
  );

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are accepted.");
      return;
    }
    setUploadError(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setUploadedPdfUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleStartFilling = () => {
    setIsChatOpen(true);
    setMessages([
      {
        role: "assistant",
        content:
          "I'm starting to fill your document. I need a few details. What's the beneficiary's full name?"
      }
    ]);
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    if (isGenerateIntent(trimmed) && !selectedTemplateKeys.length) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Select at least one document before generating the package PDFs."
        }
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

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
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    await sendMessage(input);
  };

  const hasDocument = viewerUrl !== null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div
            className={`relative h-[68vh] rounded-xl border-2 transition-colors ${
              isDragging
                ? "border-primary bg-sky-50"
                : "border-dashed border-slate-200 bg-slate-50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {viewerUrl ? (
              <iframe
                title="pdf-viewer"
                src={viewerUrl}
                className="h-full w-full rounded-xl"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-3xl text-slate-400">
                  ↑
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-700">
                    Drag a PDF here
                  </p>
                  <p className="mt-1 text-sm text-slate-500">or click to select a file</p>
                </div>
                <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Select file
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="max-w-sm text-xs text-slate-400">
                  Upload a fillable PDF form (.pdf). The document should contain editable fields for auto-fill.
                </p>
                {uploadError && (
                  <p className="text-xs font-medium text-red-600">{uploadError}</p>
                )}
                {templates.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-500">Or select a template from the side panel</p>
                    <Link
                      href={templateSelectionUrl}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary underline"
                    >
                      Select templates
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {hasDocument && (
            <div className="flex items-center gap-3">
              <Button
                className="flex-1 bg-primary text-white hover:bg-sky-700"
                onClick={handleStartFilling}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : "Start filling"}
              </Button>
              {uploadedPdfUrl && (
                <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Replace PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-4 h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Intake summary</h2>
              <span className="text-xs font-semibold text-black">{extractionProgress}</span>
            </div>
            <div className="space-y-2 text-sm">
              {extractedEntries.map(([key, value]) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black">
                    {structuredFieldLabels[key] ?? key}
                  </p>
                  <p className="mt-1 text-slate-700">{value}</p>
                </div>
              ))}
              {!extractedEntries.length ? (
                <p className="text-slate-600">
                  No relevant data collected yet.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-black">Generated PDFs</h2>
              <Link
                href={documentsHubUrl}
                className="text-xs font-semibold text-black underline"
              >
                Open documents page
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              {generatedFiles.map((file) => (
                <li key={file.url} className="flex items-center justify-between gap-2">
                  <Link
                    href={buildDocumentsPageUrl(generatedFiles, file.url)}
                    className="text-left text-black underline"
                  >
                    {file.key}
                  </Link>
                  <a
                    className="text-xs text-slate-600 underline"
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    download
                  </a>
                </li>
              ))}
              {!generatedFiles.length ? <li className="text-slate-600">No PDFs generated yet.</li> : null}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-black">Packet documents</h2>
              <button
                className="text-xs font-semibold text-black underline"
                onClick={() => setSelectedTemplateKeys(templates.map((template) => template.key))}
                type="button"
              >
                Select all (Concurrent Filing)
              </button>
            </div>

            <div className="space-y-2">
              {templates.map((template) => {
                const checked = selectedTemplateKeys.includes(template.key);
                return (
                  <label
                    key={template.id}
                    className="flex items-center gap-2 rounded border border-slate-200 px-2 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedTemplateKeys((prev) =>
                          checked
                            ? prev.filter((key) => key !== template.key)
                            : [...prev, template.key]
                        );
                      }}
                    />
                    <span className="font-medium text-slate-800">{template.key}</span>
                    <span className="text-slate-600">{template.name}</span>
                  </label>
                );
              })}
              {!templates.length ? (
                <p className="text-sm text-slate-600">
                  No templates registered yet. Add them in the admin to enable filling.
                </p>
              ) : null}
            </div>

            <Button
              className="mt-3 w-full bg-black text-white hover:bg-zinc-800"
              disabled={isLoading || !selectedTemplates.length}
              onClick={() => sendMessage("generate pdf")}
              type="button"
            >
              Generate PDFs for selected documents
            </Button>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3">
        {isChatOpen ? (
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-black">Intake chat</p>
              <button
                className="text-xs text-slate-600 underline"
                onClick={() => setIsChatOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="h-[320px] space-y-3 overflow-y-auto rounded border border-slate-200 p-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[90%] rounded px-3 py-2 text-sm ${
                    message.role === "assistant"
                      ? "bg-slate-100 text-slate-800"
                      : "ml-auto bg-black text-white"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer or 'generate pdf'"
              />
              <Button
                type="submit"
                disabled={!canSend}
                className="bg-black text-white hover:bg-zinc-800"
              >
                {isLoading ? "..." : "Send"}
              </Button>
            </form>
          </div>
        ) : null}

        <Button
          onClick={() => setIsChatOpen((v) => !v)}
          className="bg-black text-white hover:bg-zinc-800 shadow-lg"
        >
          {isChatOpen ? "Hide chat" : "Open chat"}
        </Button>
      </div>
    </div>
  );
}

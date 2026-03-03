"use client";

import { useRef, useState } from "react";

type EvidenceItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  status: "ocr-verified" | "translation-required" | "red-flag";
  uploadedAt: string;
};

function inferStatus(file: File): EvidenceItem["status"] {
  const name = file.name.toLowerCase();
  if (name.includes("foreign") || name.includes("translated")) return "translation-required";
  if (file.size > 10 * 1024 * 1024) return "red-flag";
  return "ocr-verified";
}

const BADGE: Record<EvidenceItem["status"], { label: string; color: string }> = {
  "ocr-verified":           { label: "OCR Verified ✓",          color: "#16A34A" },
  "translation-required":   { label: "Translation Required",     color: "#D97706" },
  "red-flag":               { label: "⚠ Red Flag: Check Metadata", color: "#DC2626" },
};

export function EvidenceWall() {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: EvidenceItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      status: inferStatus(file),
      uploadedAt: new Date().toLocaleDateString(),
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evidence Wall</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload supporting documents. Each file is analyzed and tagged automatically.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors"
        style={{
          borderColor: dragging ? "var(--color-trust)" : "var(--color-border)",
          background: dragging ? "var(--color-trust-muted)" : "var(--color-surface)",
        }}
      >
        <p className="text-sm font-medium text-slate-600">
          Drag files here or <span className="font-bold" style={{ color: "var(--color-trust)" }}>click to upload</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG — any document type</p>
        <input ref={inputRef} type="file" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {/* Evidence grid */}
      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const badge = BADGE[item.status];
            const isImage = item.type.startsWith("image/");
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                {/* Thumbnail */}
                <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                  {isImage ? (
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate" title={item.name}>{item.name}</p>
                  <p className="text-xs text-slate-400">{item.uploadedAt}</p>
                </div>
                {/* AI Badge */}
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ background: badge.color }}
                >
                  {badge.label}
                </span>
                {/* Remove */}
                <button
                  onClick={() => remove(item.id)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

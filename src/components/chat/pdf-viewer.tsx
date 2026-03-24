"use client";

import { DragEvent, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Template } from "./types";

type PdfViewerProps = {
  viewerUrl: string | null;
  uploadedPdfUrl: string | null;
  templates: Template[];
  templateSelectionUrl: string;
  onStartFilling: () => void;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
};

export function PdfViewer({
  viewerUrl,
  uploadedPdfUrl,
  templates,
  templateSelectionUrl,
  onStartFilling,
  onFileSelect,
  isLoading
}: PdfViewerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are accepted.");
      return;
    }
    setUploadError(null);
    onFileSelect(file);
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

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div
        className={`relative h-[68vh] rounded-xl border-2 transition-colors ${
          isDragging
            ? "border-primary bg-sky-50"
            : "border-dashed border-slate-200 bg-slate-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
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
              <p className="text-base font-semibold text-slate-700">Drag a PDF here</p>
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

      {viewerUrl && (
        <div className="flex items-center gap-3">
          <Button
            className="flex-1 bg-primary text-white hover:bg-sky-700"
            onClick={onStartFilling}
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
            ) : (
              "Start filling"
            )}
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
  );
}

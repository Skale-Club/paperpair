"use client";

import { useState } from "react";
import { DOCUMENT_TYPES, EXTRACTABLE_DOC_TYPES } from "@/lib/document-types";

type DocumentRowProps = {
  id: string;
  filename: string;
  docType: string;
  uploadedAt: string;
  signedUrl: string | null;
  onDelete: (id: string) => void;
  onExtract: (id: string) => void;
  extractStatus?: "loading" | "success" | "error" | null;
};

function getDocLabel(docType: string): string {
  return DOCUMENT_TYPES.find((d) => d.value === docType)?.label ?? docType;
}

export function DocumentRow({
  id,
  filename,
  docType,
  uploadedAt,
  signedUrl,
  onDelete,
  onExtract,
  extractStatus,
}: DocumentRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const uploadDate = new Date(uploadedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const canExtract = EXTRACTABLE_DOC_TYPES.includes(
    docType as (typeof EXTRACTABLE_DOC_TYPES)[number]
  );

  function handleDeleteClick() {
    setConfirmDelete(true);
    // Auto-revert after 5s per UI-SPEC.md
    setTimeout(() => setConfirmDelete(false), 5000);
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 gap-3">
      {/* File icon + filename */}
      <div className="flex items-center gap-3 min-w-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 flex-shrink-0 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="truncate max-w-[200px] text-sm text-slate-800">
          {filename}
        </span>
      </div>

      {/* Type badge + date */}
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: "var(--color-trust-muted)",
            color: "var(--color-muted)",
          }}
        >
          {getDocLabel(docType)}
        </span>
        <span className="text-xs text-slate-400">{uploadDate}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {canExtract && (
          <button
            type="button"
            onClick={() => onExtract(id)}
            disabled={extractStatus === "loading"}
            className="rounded-md px-2 py-1 text-xs font-medium text-white transition disabled:opacity-50"
            style={{ background: "var(--color-trust)", minHeight: "32px" }}
          >
            {extractStatus === "loading"
              ? "Extracting data…"
              : extractStatus === "success"
                ? "Data saved to your case profile."
                : extractStatus === "error"
                  ? "Extraction failed. Try again or enter the information manually in your case profile."
                  : "Extract to profile"}
          </button>
        )}

        {/* Download button */}
        {signedUrl && (
          <a
            href={signedUrl}
            download={filename}
            className="rounded-md p-1.5 text-slate-500 hover:text-slate-900 transition"
            aria-label={`Download ${filename}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        )}

        {/* Delete button / confirmation */}
        {!confirmDelete ? (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded-md p-1.5 text-slate-400 transition hover:text-[var(--color-destructive)]"
            aria-label={`Delete ${filename}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1.5" aria-live="polite">
            <span className="text-xs text-slate-500">Confirm delete?</span>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-white"
              style={{ background: "var(--color-destructive)" }}
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 border border-slate-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

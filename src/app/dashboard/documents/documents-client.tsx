"use client";

import { useState, useRef } from "react";
import { DocumentRow } from "@/components/document-row";
import { DOCUMENT_TYPES } from "@/lib/document-types";

type DocumentRecord = {
  id: string;
  filename: string;
  docType: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  signedUrl: string | null;
};

export function DocumentsClient({
  initialDocuments,
}: {
  initialDocuments: DocumentRecord[];
}) {
  const [documents, setDocuments] =
    useState<DocumentRecord[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPendingFile(file);
    setSelectedDocType("");
    setUploadError(null);
  }

  async function handleUpload() {
    if (!pendingFile || !selectedDocType) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", pendingFile);
    formData.append("docType", selectedDocType);
    // Include stepSlug "documents" so the existing route passes slug validation
    formData.append("stepSlug", "documents");

    try {
      const res = await fetch("/api/dashboard/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setUploadError(
          body.error ??
            "Upload failed. Check your connection and try again. If the problem continues, contact support."
        );
        return;
      }
      // Re-fetch document list after upload
      const listRes = await fetch("/api/documents");
      if (listRes.ok) {
        const data = (await listRes.json()) as { documents: DocumentRecord[] };
        setDocuments(data.documents);
      }
      // Reset form
      setPendingFile(null);
      setSelectedDocType("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setUploadError(
        "Upload failed. Check your connection and try again. If the problem continues, contact support."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  }

  function handleExtract(id: string) {
    // Handled in Plan 07 (02-07-PLAN.md) — placeholder for now
    window.location.href = `/dashboard/documents/${id}/extract`;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Documents
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload your passport, marriage certificate, and other supporting
          documents to keep everything in one place.
        </p>
      </div>

      {/* Upload zone */}
      <div className="rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 text-center">
        {!pendingFile ? (
          <>
            <label htmlFor="doc-upload" className="cursor-pointer">
              <div
                className="mx-auto flex h-11 w-fit items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "var(--color-trust)" }}
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload document
              </div>
            </label>
            <input
              id="doc-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-xs text-slate-400">
              PDF, JPEG, or PNG — max 10 MB
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 font-medium">
              {pendingFile.name}
            </p>
            <div>
              <label
                htmlFor="doc-type-select"
                className="block text-xs font-semibold text-slate-600 mb-1"
              >
                Select document type
              </label>
              <select
                id="doc-type-select"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Select document type
                </option>
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedDocType || uploading}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                style={{ background: "var(--color-trust)" }}
              >
                {uploading ? "Uploading..." : "Upload document"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
            </div>
            {uploadError && (
              <p className="text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        )}
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No documents uploaded yet
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Upload your passport, marriage certificate, and other supporting
            documents to keep everything in one place.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              {...doc}
              onDelete={handleDelete}
              onExtract={handleExtract}
            />
          ))}
        </div>
      )}
    </div>
  );
}

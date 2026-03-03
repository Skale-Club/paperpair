"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UploadedFile = {
  name: string;
  path: string;
  uploadedAt: string;
};

type DashboardStepsResponse = {
  steps?: Array<{
    slug: string;
    data?: Record<string, unknown>;
  }>;
};

function isUploadedFile(value: unknown): value is UploadedFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UploadedFile>;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.path === "string" &&
    typeof candidate.uploadedAt === "string"
  );
}

function extractFiles(value: unknown): UploadedFile[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const files = (value as Record<string, unknown>).files;
  if (!Array.isArray(files)) {
    return [];
  }

  return files.filter(isUploadedFile);
}

export default function DocumentsPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSavedFiles = async () => {
      try {
        const response = await fetch("/api/dashboard/steps", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as DashboardStepsResponse;
        const documentsStep = payload.steps?.find((step) => step.slug === "documents");
        const existingFiles = extractFiles(documentsStep?.data);

        if (isMounted) {
          setFiles(existingFiles);
        }
      } catch {
        // Non-blocking if read fails.
      }
    };

    void loadSavedFiles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("stepSlug", "documents");

    try {
      const response = await fetch("/api/dashboard/upload", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as {
        error?: string;
        file?: UploadedFile;
      };

      if (!response.ok || !payload.file) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      setFiles((current) => [...current, payload.file as UploadedFile]);
      setMessage("File uploaded successfully.");
    } catch (uploadError) {
      const uploadMessage =
        uploadError instanceof Error ? uploadError.message : "Unable to upload file.";
      setError(uploadMessage);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleNext = async () => {
    if (files.length === 0) {
      setError("Upload at least one file before continuing.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/steps", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stepSlug: "documents",
          status: "COMPLETED"
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Failed to complete this step.");
      }

      router.push("/dashboard/review");
      router.refresh();
    } catch (stepError) {
      const stepMessage =
        stepError instanceof Error ? stepError.message : "Unable to move to review.";
      setError(stepMessage);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Step 5 of 6</p>
        <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
        <p className="mt-1 text-sm text-slate-600">Attach PDFs, JPGs, or PNGs (up to 10MB each).</p>
      </div>

      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={handleUpload}
          disabled={uploading}
          className="w-full text-sm"
        />

        {uploading && <p className="mt-2 text-sm text-slate-600">Uploading file...</p>}
      </div>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-900">Uploaded files</h3>

        {files.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            No files uploaded yet.
          </p>
        )}

        {files.map((file) => (
          <div key={`${file.path}-${file.uploadedAt}`} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{file.path}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={saving}
        className="rounded-md bg-black px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Next Step"}
      </button>
    </div>
  );
}

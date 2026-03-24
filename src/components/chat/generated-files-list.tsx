"use client";

import Link from "next/link";
import type { ChatResponse } from "./types";

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

type GeneratedFilesListProps = {
  files: Array<{ key: string; url: string }>;
};

export function GeneratedFilesList({ files }: GeneratedFilesListProps) {
  const hubUrl = buildDocumentsPageUrl(files);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-black">Generated PDFs</h2>
        <Link
          href={hubUrl}
          className="text-xs font-semibold text-black underline"
        >
          Open documents page
        </Link>
      </div>
      <ul className="space-y-2 text-sm">
        {files.map((file) => (
          <li key={file.url} className="flex items-center justify-between gap-2">
            <Link
              href={buildDocumentsPageUrl(files, file.url)}
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
        {files.length === 0 && (
          <li className="text-slate-600">No PDFs generated yet.</li>
        )}
      </ul>
    </div>
  );
}

export { buildDocumentsPageUrl };

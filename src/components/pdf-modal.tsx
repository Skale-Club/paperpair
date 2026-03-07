"use client";

import { useEffect } from "react";
import { PdfViewer } from "@/components/pdf-viewer";

type Props = {
  url: string;
  title: string;
  onClose: () => void;
};

export function PdfModal({ url, title, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-4">
        <div className="mb-2 flex shrink-0 items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-md">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto rounded-xl bg-slate-200">
          <PdfViewer url={url} />
        </div>
      </div>
    </div>
  );
}

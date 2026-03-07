"use client";

import { useEffect, useRef, useState } from "react";

interface PdfAnnotation {
  id: string;
  subtype: string;
  fieldType?: string;
  fieldName?: string;
  rect: [number, number, number, number];
  readOnly?: boolean;
  multiLine?: boolean;
  radioButton?: boolean;
  checkBox?: boolean;
  options?: Array<{ exportValue: string; displayValue: string }>;
}

interface PageInfo {
  pageIndex: number;
  viewportWidth: number;
  viewportHeight: number;
  scale: number;
  annotations: PdfAnnotation[];
}

type Props = {
  url: string;
  title: string;
  onClose: () => void;
};

export function PdfModal({ url, title, onClose }: Props) {
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasesRef = useRef<Map<number, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const SCALE = 1.5;

    async function load() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjs.getDocument(url).promise;
        if (cancelled) return;

        const infos: PageInfo[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          if (cancelled) return;

          const viewport = page.getViewport({ scale: SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;

          canvasesRef.current.set(i - 1, canvas);
          const annotations = (await page.getAnnotations()) as PdfAnnotation[];
          if (cancelled) return;

          infos.push({
            pageIndex: i - 1,
            viewportWidth: viewport.width,
            viewportHeight: viewport.height,
            scale: SCALE,
            annotations,
          });
        }

        setPageInfos(infos);
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-4">
        {/* Header */}
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

        {/* PDF scroll area */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-slate-200 px-4 py-4">
          {loading && (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading PDF…
            </div>
          )}
          {error && (
            <div className="flex h-full items-center justify-center text-sm text-red-500">
              Could not load PDF.
            </div>
          )}
          {!loading && !error && (
            <div className="flex flex-col items-center gap-4">
              {pageInfos.map((info) => (
                <PageRenderer
                  key={info.pageIndex}
                  info={info}
                  canvas={canvasesRef.current.get(info.pageIndex)!}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageRenderer({ info, canvas }: { info: PageInfo; canvas: HTMLCanvasElement }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Mount the pre-rendered canvas element
  useEffect(() => {
    const slot = canvasSlotRef.current;
    if (!slot || !canvas) return;
    slot.innerHTML = "";
    canvas.style.cssText = "width:100%;height:auto;display:block;";
    slot.appendChild(canvas);
  }, [canvas]);

  // Measure container for overlay positioning
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const displayScale = containerWidth > 0 ? containerWidth / info.viewportWidth : 0;
  const widgets = info.annotations.filter((a) => a.subtype === "Widget" && !a.readOnly);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white shadow-md"
      style={{
        maxWidth: info.viewportWidth,
        aspectRatio: `${info.viewportWidth} / ${info.viewportHeight}`,
      }}
    >
      <div ref={canvasSlotRef} className="absolute inset-0" />

      {displayScale > 0 &&
        widgets.map((ann) => {
          const [x1, y1, x2, y2] = ann.rect;

          // PDF origin is bottom-left; canvas/CSS origin is top-left.
          // Annotation rect is in PDF user-space (unscaled points).
          // Canvas coords = [x * scale, viewportHeight - y * scale].
          // Display coords = canvas coords * displayScale.
          const left = x1 * info.scale * displayScale;
          const top = (info.viewportHeight - y2 * info.scale) * displayScale;
          const width = (x2 - x1) * info.scale * displayScale;
          const height = (y2 - y1) * info.scale * displayScale;

          const base: React.CSSProperties = {
            position: "absolute",
            left,
            top,
            width,
            height,
            boxSizing: "border-box",
            fontSize: Math.min(height * 0.7, 13),
            background: "rgba(219, 234, 254, 0.45)",
            border: "1px solid rgba(59, 130, 246, 0.45)",
            outline: "none",
            padding: "1px 4px",
          };

          if (ann.fieldType === "Btn") {
            return (
              <input
                key={ann.id}
                type={ann.radioButton ? "radio" : "checkbox"}
                name={ann.fieldName}
                style={{ ...base, background: "transparent", padding: 0, cursor: "pointer" }}
              />
            );
          }

          if (ann.fieldType === "Ch" && ann.options) {
            return (
              <select key={ann.id} style={base}>
                <option value="" />
                {ann.options.map((opt) => (
                  <option key={opt.exportValue} value={opt.exportValue}>
                    {opt.displayValue}
                  </option>
                ))}
              </select>
            );
          }

          if (ann.multiLine) {
            return <textarea key={ann.id} style={{ ...base, resize: "none", lineHeight: 1.3 }} />;
          }

          // void y1 (not needed directly but let's avoid lint)
          void y1;
          return <input key={ann.id} type="text" style={base} />;
        })}
    </div>
  );
}

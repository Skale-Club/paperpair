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
};

export function PdfViewer({ url }: Props) {
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasesRef = useRef<Map<number, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    setPageInfos([]);
    setLoading(true);
    setError(false);
    canvasesRef.current.clear();

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
          await page.render({ canvas, viewport }).promise;
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Loading PDF…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-400">
        Could not load PDF.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4">
      {pageInfos.map((info) => (
        <PageRenderer
          key={info.pageIndex}
          info={info}
          canvas={canvasesRef.current.get(info.pageIndex)!}
        />
      ))}
    </div>
  );
}

function PageRenderer({ info, canvas }: { info: PageInfo; canvas: HTMLCanvasElement }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const slot = canvasSlotRef.current;
    if (!slot || !canvas) return;
    slot.innerHTML = "";
    canvas.style.cssText = "width:100%;height:auto;display:block;";
    slot.appendChild(canvas);
  }, [canvas]);

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
          void y1;

          const left = x1 * info.scale * displayScale;
          const top = (info.viewportHeight - y2 * info.scale) * displayScale;
          const width = (x2 - x1) * info.scale * displayScale;
          const height = (y2 - y1) * info.scale * displayScale;

          const base: React.CSSProperties = {
            position: "absolute",
            left, top, width, height,
            boxSizing: "border-box",
            fontSize: Math.min(height * 0.7, 13),
            background: "rgba(219, 234, 254, 0.45)",
            border: "1px solid rgba(59, 130, 246, 0.45)",
            outline: "none",
            padding: "1px 4px",
          };

          if (ann.fieldType === "Btn") {
            return (
              <input key={ann.id} type={ann.radioButton ? "radio" : "checkbox"}
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
                  <option key={opt.exportValue} value={opt.exportValue}>{opt.displayValue}</option>
                ))}
              </select>
            );
          }
          if (ann.multiLine) {
            return <textarea key={ann.id} style={{ ...base, resize: "none", lineHeight: 1.3 }} />;
          }
          return <input key={ann.id} type="text" style={base} />;
        })}
    </div>
  );
}

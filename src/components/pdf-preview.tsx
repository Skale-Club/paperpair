"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  /** Extra CSS classes applied to the outer container */
  className?: string;
};

/**
 * Renders the first page of a PDF as a blurred visual preview.
 * Used on form pack cards so users can see the real USCIS form behind a blur.
 */
export function PdfPreview({ url, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Use the worker we copied to /public
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const containerWidth = container.clientWidth || 200;

        // Scale PDF page to fill the card width
        const naturalViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / naturalViewport.width;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx || cancelled) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        // silently ignore — fallback to skeleton
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden bg-white ${className}`}
    >
      {/* Skeleton shown while PDF renders */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-100" />
      )}

      {/* Actual PDF canvas — blurred and slightly scaled up to hide edge artifacts */}
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 w-full"
        style={{
          filter: "blur(3px) brightness(1.02)",
          transform: "scale(1.08)",
          transformOrigin: "top center",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

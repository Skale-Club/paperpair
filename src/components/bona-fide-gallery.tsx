"use client";

import { useRef, useState } from "react";

type Photo = {
  id: string;
  name: string;
  url: string;
  date: string;
};

function extractDate(file: File): string {
  // Fallback to file.lastModified — EXIF parsing requires a lib
  return new Date(file.lastModified).toLocaleDateString("en-US");
}

export function BonaFideGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: Photo[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${Date.now()}-${f.name}`,
        name: f.name,
        url: URL.createObjectURL(f),
        date: extractDate(f),
      }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setDismissed(false);
  };

  const remove = (id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  // Group by date and flag dates with 3+ photos
  const dateGroups = photos.reduce<Record<string, number>>((acc, p) => {
    acc[p.date] = (acc[p.date] || 0) + 1;
    return acc;
  }, {});
  const flaggedDates = Object.entries(dateGroups).filter(([, count]) => count >= 3);
  const showWarning = flaggedDates.length > 0 && !dismissed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bona Fide Marriage Gallery</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload photos that demonstrate your genuine marriage. USCIS will review these during adjudication.
        </p>
      </div>

      {/* Warning banner */}
      {showWarning && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> {flaggedDates.length > 1 ? "Multiple dates have" : ""}
            {flaggedDates.map(([date, count]) => ` ${count} photos on ${date}`).join(",")}. USCIS may question whether these were taken specifically for this application.
          </p>
          <button onClick={() => setDismissed(true)} className="shrink-0 text-xs text-amber-600 underline">Dismiss</button>
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-[#1A365D] hover:bg-[#EBF0F8] transition-colors"
      >
        <p className="text-sm font-medium text-slate-600">
          Click to upload photos <span className="text-slate-400">(JPG, PNG, HEIC)</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => addPhotos(e.target.files)}
        />
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => {
            const flagged = (dateGroups[photo.date] ?? 0) >= 3;
            return (
              <div
                key={photo.id}
                className={`relative rounded-xl overflow-hidden border-2 ${flagged ? "border-amber-400" : "border-slate-200"}`}
              >
                <img src={photo.url} alt={photo.name} className="h-40 w-full object-cover" />
                <div className="p-2 bg-white">
                  <p className="text-xs text-slate-500 truncate">{photo.date}</p>
                  {flagged && (
                    <span className="text-xs font-medium text-amber-600">⚠ Same date</span>
                  )}
                </div>
                <button
                  onClick={() => remove(photo.id)}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Remove photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

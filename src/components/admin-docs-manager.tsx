"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MappingRow = { userField: string; pdfField: string; note?: string };

type Doc = {
  id: string;
  key: string;
  name: string;
  filePath: string;
  meta?: {
    mapping?: MappingRow[];
    edition?: string;
    category?: "template" | "checklist";
    mandatory?: boolean;
  };
};

export function AdminDocsManager({ initialDocs }: { initialDocs: Doc[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([
    { userField: "Full name", pdfField: "fullName" },
    { userField: "Date of birth", pdfField: "dateOfBirth" },
    { userField: "I-94 number", pdfField: "i94Number" }
  ]);

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setStatus("Attach a PDF first.");
      return;
    }

    setStatus("Uploading PDF...");
    const formData = new FormData(event.currentTarget);
    formData.append("file", file);

    const cleanMapping = mappingRows.filter((row) => row.userField && row.pdfField);
    if (cleanMapping.length) {
      formData.append("mapping", JSON.stringify(cleanMapping));
    }

    const res = await fetch("/api/admin/documents", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "Upload error.");
      return;
    }

    const data = await res.json();
    setDocs(data.documents);
    setStatus("Document updated successfully.");
    setFile(null);
    (event.currentTarget as HTMLFormElement).reset();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
    }
  };

  const addRow = () => {
    setMappingRows((rows) => [...rows, { userField: "", pdfField: "" }]);
  };

  const mappingPreview = useMemo(
    () =>
      mappingRows
        .filter((row) => row.userField && row.pdfField)
        .map((row) => `${row.userField} → ${row.pdfField}`),
    [mappingRows]
  );

  return (
    <div className="space-y-8">
      <form 
        className="space-y-6 rounded-2xl border border-trust-muted/20 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]" 
        onSubmit={onUpload}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input 
            name="key" 
            placeholder="Document key (e.g., I-130)" 
            required 
            className="rounded-xl border-trust-muted/30 focus:border-trust focus:ring-trust/5"
          />
          <Input 
            name="name" 
            placeholder="Friendly name (e.g., I-130 Petition)" 
            required 
            className="rounded-xl border-trust-muted/30 focus:border-trust focus:ring-trust/5"
          />
          <Input 
            name="edition" 
            placeholder="Edition (e.g., 01/20/25)" 
            className="rounded-xl border-trust-muted/30 focus:border-trust focus:ring-trust/5"
          />
          <select
            name="category"
            className="rounded-xl border border-trust-muted/30 bg-white px-3 py-2 text-sm focus:border-trust focus:outline-none focus:ring-4 focus:ring-trust/5"
            defaultValue="template"
          >
            <option value="template">Template</option>
            <option value="checklist">Mandatory checklist</option>
          </select>
        </div>

        <label
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-trust-muted/30 bg-trust-muted/5 px-4 py-8 text-center transition-all hover:border-trust hover:bg-trust/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-trust/10 text-trust transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Drag & drop new USCIS form</p>
            <p className="text-xs text-slate-500 font-medium">PDF only • up to 10MB</p>
          </div>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="mt-2 text-xs font-bold text-trust bg-trust/10 px-3 py-1 rounded-full">
              Selected: {file.name}
            </p>
          ) : null}
        </label>

        <div className="rounded-2xl border border-trust-muted/20 bg-trust-muted/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-trust"></div>
              <p className="text-sm font-bold text-slate-900">Auto-populate mapping</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="rounded-lg border-trust-muted/40 text-trust hover:bg-trust/5 font-bold"
            >
              Add row
            </Button>
          </div>
          <div className="grid gap-2">
            {mappingRows.map((row, index) => (
              <div key={`${row.userField}-${index}`} className="grid gap-2 md:grid-cols-3">
                <Input
                  value={row.userField}
                  onChange={(e) =>
                    setMappingRows((rows) =>
                      rows.map((r, idx) => (idx === index ? { ...r, userField: e.target.value } : r))
                    )
                  }
                  placeholder="User data point"
                  className="rounded-lg border-trust-muted/30 focus:border-trust"
                />
                <Input
                  value={row.pdfField}
                  onChange={(e) =>
                    setMappingRows((rows) =>
                      rows.map((r, idx) => (idx === index ? { ...r, pdfField: e.target.value } : r))
                    )
                  }
                  placeholder="PDF field name"
                  className="rounded-lg border-trust-muted/30 focus:border-trust"
                />
                <Input
                  value={row.note ?? ""}
                  onChange={(e) =>
                    setMappingRows((rows) =>
                      rows.map((r, idx) => (idx === index ? { ...r, note: e.target.value } : r))
                    )
                  }
                  placeholder="Notes (optional)"
                  className="rounded-lg border-trust-muted/30 focus:border-trust"
                />
              </div>
            ))}
          </div>
        </div>

        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer">
          <input type="checkbox" name="mandatory" className="h-4 w-4 rounded border-trust-muted/40 text-trust focus:ring-trust" />
          Mark as mandatory checklist (push to all users)
        </label>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button type="submit" className="rounded-xl bg-trust px-6 font-bold text-white hover:opacity-90 shadow-md shadow-trust/10">
            Upload / Update Template
          </Button>
          {mappingPreview.length ? (
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {mappingPreview.length} fields mapped
            </p>
          ) : null}
        </div>
      </form>

      <div className="rounded-2xl border border-trust-muted/20 bg-white p-6 shadow-sm ring-1 ring-black/[0.01]">
        <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-trust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
          Current templates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <div key={doc.id} className="group relative flex flex-col rounded-xl border border-trust-muted/20 bg-trust-muted/5 p-4 transition-all hover:bg-white hover:shadow-md hover:ring-1 hover:ring-trust/10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-trust transition-colors">{doc.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{doc.key}</p>
                </div>
                <a
                  className="rounded-lg bg-white p-2 text-trust shadow-sm ring-1 ring-black/[0.05] transition-transform hover:scale-110 active:scale-95"
                  href={doc.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View PDF"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </a>
              </div>
              <div className="mt-4 grid gap-1.5 text-[11px] font-medium text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Category</span>
                  <span className="font-bold text-slate-700">{doc.meta?.category ?? "template"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Edition</span>
                  <span className="font-bold text-slate-700">{doc.meta?.edition ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mandatory</span>
                  <span className={`font-bold ${doc.meta?.mandatory ? "text-trust" : "text-slate-400"}`}>
                    {doc.meta?.mandatory ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {!docs.length ? <p className="col-span-full py-8 text-center text-sm font-medium text-slate-400 italic">No documents uploaded yet.</p> : null}
        </div>
      </div>

      {status ? (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <p className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-2xl ring-1 ring-white/10">
            {status}
          </p>
        </div>
      ) : null}
    </div>
  );
}

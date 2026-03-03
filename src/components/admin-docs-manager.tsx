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
    <div className="space-y-6">
      <form className="space-y-4 rounded-lg border border-sand-200 bg-white p-4" onSubmit={onUpload}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input name="key" placeholder="Document key (e.g., I-130)" required />
          <Input name="name" placeholder="Friendly name (e.g., I-130 Petition)" required />
          <Input name="edition" placeholder="Edition (e.g., 01/20/25)" />
          <select
            name="category"
            className="rounded-lg border border-sand-300 px-3 py-2 text-sm"
            defaultValue="template"
          >
            <option value="template">Template</option>
            <option value="checklist">Mandatory checklist</option>
          </select>
        </div>

        <label
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand-300 bg-sand-50 px-4 py-6 text-center hover:border-navy"
        >
          <p className="text-sm font-semibold text-sand-900">Drag & drop new USCIS form edition</p>
          <p className="text-xs text-sand-600">PDF only • up to 10MB</p>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? <p className="text-xs text-navy">Selected: {file.name}</p> : null}
        </label>

        <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-sand-900">Auto-populate mapping</p>
            <Button
              type="button"
              onClick={addRow}
              className="bg-sand-200 text-sand-900 hover:bg-sand-300"
            >
              Add row
            </Button>
          </div>
          <div className="mt-3 grid gap-2">
            {mappingRows.map((row, index) => (
              <div key={`${row.userField}-${index}`} className="grid gap-2 md:grid-cols-3">
                <Input
                  value={row.userField}
                  onChange={(e) =>
                    setMappingRows((rows) =>
                      rows.map((r, idx) => (idx === index ? { ...r, userField: e.target.value } : r))
                    )
                  }
                  placeholder="User data point (e.g., Full name)"
                />
                <Input
                  value={row.pdfField}
                  onChange={(e) =>
                    setMappingRows((rows) =>
                      rows.map((r, idx) => (idx === index ? { ...r, pdfField: e.target.value } : r))
                    )
                  }
                  placeholder="PDF field name / coordinate key"
                />
                <Input
                  value={row.note ?? ""}
                  onChange={(e) =>
                    setMappingRows((rows) =>
                      rows.map((r, idx) => (idx === index ? { ...r, note: e.target.value } : r))
                    )
                  }
                  placeholder="Notes (optional)"
                />
              </div>
            ))}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-sand-800">
          <input type="checkbox" name="mandatory" className="rounded border-sand-300" />
          Mark as mandatory checklist (push to all users)
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Upload / Update Template</Button>
          {mappingPreview.length ? (
            <p className="text-xs text-sand-600">
              Mapping: {mappingPreview.join(" • ")}
            </p>
          ) : null}
        </div>
      </form>

      <div className="rounded-lg border border-sand-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Current templates</h2>
        <ul className="space-y-2 text-sm">
          {docs.map((doc) => (
            <li key={doc.id} className="rounded border border-sand-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sand-900">{doc.name}</p>
                  <p className="text-xs text-sand-600">{doc.key}</p>
                </div>
                <a
                  className="text-xs font-semibold text-navy underline"
                  href={doc.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>
              </div>
              <div className="mt-2 grid gap-1 text-xs text-sand-700 md:grid-cols-2">
                <span>Category: {doc.meta?.category ?? "template"}</span>
                <span>Edition: {doc.meta?.edition ?? "—"}</span>
                <span>Mandatory: {doc.meta?.mandatory ? "Yes" : "No"}</span>
                <span>
                  Mapping:{" "}
                  {doc.meta?.mapping?.length
                    ? doc.meta.mapping.map((m) => `${m.userField} → ${m.pdfField}`).join(", ")
                    : "None"}
                </span>
              </div>
            </li>
          ))}
          {!docs.length ? <li>No documents uploaded yet.</li> : null}
        </ul>
      </div>

      {status ? <p className="text-sm text-sand-600">{status}</p> : null}
    </div>
  );
}

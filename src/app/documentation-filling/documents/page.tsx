import Link from "next/link";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

type SearchParams = {
  file?: string | string[];
  focus?: string;
};

type DocumentPreview = {
  filePath: string;
  fileName: string;
  pageCount: number | null;
};

function normalizePath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "";
  }
  return value;
}

function toPublicFilePath(filePath: string) {
  const normalized = path.posix.normalize(filePath);
  if (
    !normalized.startsWith("/") ||
    normalized.startsWith("//") ||
    (!normalized.startsWith("/generated/") && !normalized.startsWith("/uploads/"))
  ) {
    return "";
  }

  return path.join(process.cwd(), "public", normalized.slice(1));
}

async function getPdfPageCount(filePath: string) {
  const localPath = toPublicFilePath(filePath);
  if (!localPath) {
    return null;
  }

  try {
    const bytes = await readFile(localPath);
    const pdfDoc = await PDFDocument.load(bytes);
    return pdfDoc.getPageCount();
  } catch {
    return null;
  }
}

function buildDocumentsUrl(files: string[], focus: string) {
  const params = new URLSearchParams();
  files.forEach((file) => params.append("file", file));
  params.set("focus", focus);
  return `/documentation-filling/documents?${params.toString()}`;
}

function formatPageCount(pageCount: number | null) {
  if (!pageCount) {
    return "Page count unavailable";
  }
  if (pageCount === 1) {
    return "1 page";
  }
  return `${pageCount} pages`;
}

export default async function DocumentationDocumentsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const filesParam = resolved.file;
  const filesRaw = Array.isArray(filesParam) ? filesParam : filesParam ? [filesParam] : [];
  const files = Array.from(new Set(filesRaw.map(normalizePath).filter(Boolean)));
  const focus = resolved.focus ? normalizePath(resolved.focus) : "";
  const activeFile = focus && files.includes(focus) ? focus : files[0] ?? "";
  const documents: DocumentPreview[] = await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      fileName: filePath.split("/").pop() ?? filePath,
      pageCount: await getPdfPageCount(filePath)
    }))
  );
  const activeDocument = documents.find((doc) => doc.filePath === activeFile) ?? null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black">
            Documentation Filling
          </p>
          <h1 className="text-3xl font-semibold text-black">Selected documents</h1>
          <p className="text-zinc-800">
            Access, view, and download every PDF generated for your packet.
          </p>
        </div>

        <Link
          href="/documentation-filling"
          className="inline-flex rounded-xl border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
        >
          Back to Documentation Filling
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-black">Available documents</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => {
            const isActive = doc.filePath === activeFile;
            return (
              <Link
                key={doc.filePath}
                href={buildDocumentsUrl(files, doc.filePath)}
                className={`rounded-xl border p-4 transition ${
                  isActive
                    ? "border-black bg-zinc-50"
                    : "border-slate-200 bg-white hover:border-black hover:bg-zinc-50"
                }`}
              >
                <p className="truncate text-sm font-semibold text-black">{doc.fileName}</p>
                <p className="mt-1 text-xs text-slate-600">{formatPageCount(doc.pageCount)}</p>
              </Link>
            );
          })}
          {!documents.length ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No document selected. Generate PDFs in Documentation Filling first.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-black">
              {activeDocument ? activeDocument.fileName : "Viewer"}
            </h2>
            {activeDocument ? (
              <p className="text-sm text-slate-600">{formatPageCount(activeDocument.pageCount)}</p>
            ) : null}
          </div>
          {activeDocument ? (
            <a
              className="inline-flex rounded-xl border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
              href={activeDocument.filePath}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open PDF in new tab
            </a>
          ) : null}
        </div>

        <div className="h-[82vh] rounded-xl border border-slate-200 bg-slate-50">
          {activeFile ? (
            <iframe title="selected-document" src={activeFile} className="h-full w-full rounded-xl" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">
              No document selected.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

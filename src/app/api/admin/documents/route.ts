import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin";

const MAX_PDF_UPLOAD_BYTES = 10 * 1024 * 1024;

function looksLikePdf(bytes: Buffer) {
  return bytes.subarray(0, 5).toString("utf8") === "%PDF-";
}

type TemplateMeta = {
  mapping?: Array<{ userField: string; pdfField: string; note?: string }>;
  edition?: string;
  category?: "template" | "checklist";
  mandatory?: boolean;
  updatedAt: string;
};

async function readMeta(key: string): Promise<TemplateMeta | null> {
  const metaPath = path.join(process.cwd(), "public", "uploads", `${key}.meta.json`);
  try {
    const raw = await readFile(metaPath, "utf8");
    return JSON.parse(raw) as TemplateMeta;
  } catch {
    return null;
  }
}

export async function GET() {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.documentTemplate.findMany({
    orderBy: { updatedAt: "desc" }
  });

  const enriched = await Promise.all(
    documents.map(async (doc) => {
      const meta = await readMeta(doc.key);
      return { ...doc, meta: meta ?? undefined };
    })
  );

  return NextResponse.json({ documents: enriched });
}

export async function POST(request: Request) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const key = String(formData.get("key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const edition = String(formData.get("edition") ?? "").trim();
  const category = (String(formData.get("category") ?? "template").trim() || "template") as
    | "template"
    | "checklist";
  const mandatory = String(formData.get("mandatory") ?? "").trim().toLowerCase() === "on";
  const mappingRaw = String(formData.get("mapping") ?? "").trim();
  const file = formData.get("file");

  if (!key || !name || !(file instanceof File)) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDFs are accepted" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_PDF_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Invalid PDF. File must be 10MB or less." },
      { status: 400 }
    );
  }

  if (file.type && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Invalid MIME type. Please send a PDF." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!looksLikePdf(bytes)) {
    return NextResponse.json(
      { error: "Invalid file. Content does not match a PDF." },
      { status: 400 }
    );
  }

  const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, "_");
  if (!safeKey) {
    return NextResponse.json({ error: "Invalid document key" }, { status: 400 });
  }

  let mapping: TemplateMeta["mapping"] = undefined;
  if (mappingRaw) {
    try {
      const parsed = JSON.parse(mappingRaw) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error("Mapping must be an array");
      }
      mapping = parsed
        .map((row) => ({
          userField: String((row as { userField?: string }).userField ?? "").trim(),
          pdfField: String((row as { pdfField?: string }).pdfField ?? "").trim(),
          note: String((row as { note?: string }).note ?? "").trim()
        }))
        .filter((row) => row.userField && row.pdfField);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message || "Invalid mapping JSON" }, { status: 400 });
    }
  }

  const filename = `${safeKey}.pdf`;
  const relativePath = `/uploads/${filename}`;
  const outputDir = path.join(process.cwd(), "public", "uploads");
  const outputPath = path.join(outputDir, filename);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, bytes);

  const meta: TemplateMeta = {
    mapping,
    edition: edition || undefined,
    category,
    mandatory,
    updatedAt: new Date().toISOString()
  };

  if (mapping || edition || mandatory || category !== "template") {
    const metaPath = path.join(outputDir, `${safeKey}.meta.json`);
    await writeFile(metaPath, JSON.stringify(meta, null, 2));
  }

  await prisma.documentTemplate.upsert({
    where: { key: safeKey },
    create: {
      key: safeKey,
      name,
      filePath: relativePath
    },
    update: {
      name,
      filePath: relativePath
    }
  });

  revalidateTag("admin-documents");
  revalidateTag("admin-audit");

  const documents = await prisma.documentTemplate.findMany({
    orderBy: { updatedAt: "desc" }
  });

  const enriched = await Promise.all(
    documents.map(async (doc) => {
      const docMeta = await readMeta(doc.key);
      return { ...doc, meta: docMeta ?? undefined };
    })
  );

  return NextResponse.json({ documents: enriched });
}

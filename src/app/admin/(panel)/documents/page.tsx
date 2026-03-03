import { AdminDocsManager } from "@/components/admin-docs-manager";
import { prisma } from "@/lib/prisma";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function loadMeta(key: string) {
  const metaPath = path.join(process.cwd(), "public", "uploads", `${key}.meta.json`);
  try {
    const raw = await readFile(metaPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export const dynamic = "force-dynamic";

export default async function AdminDocsPage() {
  let docs: Awaited<ReturnType<typeof prisma.documentTemplate.findMany>>;
  try {
    docs = await prisma.documentTemplate.findMany({
      orderBy: { updatedAt: "desc" }
    });
  } catch {
    docs = [];
  }
  const docsWithMeta = await Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      meta: await loadMeta(doc.key)
    }))
  );

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-sand-900">PDF Documentation Manager</h1>
        <p className="mt-1 text-sm text-sand-600">
          Keep default USCIS forms and mandatory checklists synced for all regular users.
        </p>
      </div>
      <AdminDocsManager initialDocs={docsWithMeta} />
    </section>
  );
}

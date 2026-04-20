import { AdminDocsManager } from "@/components/admin-docs-manager";
import { getAdminDocumentTemplates } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDocsPage() {
  const docsWithMeta = await getAdminDocumentTemplates();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust">Documentation</p>
        <h1 className="text-2xl font-bold text-slate-900">PDF Template Manager</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Keep USCIS forms and mandatory checklists synced for all regular users.
        </p>
      </div>
      <AdminDocsManager initialDocs={docsWithMeta} />
    </section>
  );
}

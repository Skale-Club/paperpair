import { AdminDocsManager } from "@/components/admin-docs-manager";
import { getAdminDocumentTemplates } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDocsPage() {
  const docsWithMeta = await getAdminDocumentTemplates();

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

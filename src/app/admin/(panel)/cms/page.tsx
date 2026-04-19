import { AdminCmsEditor } from "@/components/admin-cms-editor";
import { getAdminCmsPages } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  const pages = await getAdminCmsPages();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-sand-900">Page Editor</h1>
        <p className="mt-1 text-sm text-sand-600">
          Edit public pages with live draft preview, then publish when the copy is ready.
        </p>
      </div>
      <AdminCmsEditor initialPages={pages} />
    </section>
  );
}

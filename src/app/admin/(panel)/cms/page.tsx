import { AdminCmsEditor } from "@/components/admin-cms-editor";
import { getAdminCmsPages } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  const pages = await getAdminCmsPages();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust">Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">Landing Page Editor</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Edit public pages with live draft preview, then publish when the copy is ready.
        </p>
      </div>
      <AdminCmsEditor initialPages={pages} />
    </section>
  );
}

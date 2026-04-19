export const dynamic = "force-dynamic";

import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <header className="rounded-2xl bg-gradient-to-r from-navy via-blue-700 to-sand-500 px-5 py-4 text-white shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">Skale Admin</p>
            <h1 className="text-xl font-semibold">Control Center</h1>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Admin view</span>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-[auto_1fr] flex-1">
        <AdminSidebar />
        <div className="rounded-2xl border border-sand-200 bg-white p-4 md:p-6 shadow-sm min-w-0">
          {children}
        </div>
      </div>
    </section>
  );
}

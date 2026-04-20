import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-screen flex-col overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <header className="z-30 px-6 py-3 shadow-sm" style={{ background: "var(--color-trust)" }}>
        <div className="flex items-center justify-between gap-3 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Admin Suite</p>
            <h1 className="text-base font-bold tracking-tight">Management Suite</h1>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
            Authorized Admin
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </section>
  );
}

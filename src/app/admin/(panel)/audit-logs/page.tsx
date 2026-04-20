import { Suspense } from "react";
import { getAdminAuditLogs } from "@/lib/admin-data";
import { TableSkeleton } from "@/components/admin-skeletons";

type LogEntry = {
  id: string;
  at: Date;
  actor: string;
  message: string;
  scope: "case" | "template";
};

async function LogsList() {
  const logs: LogEntry[] = await getAdminAuditLogs();

  return (
    <div className="overflow-hidden rounded-2xl border border-trust-muted/20 bg-white shadow-sm ring-1 ring-black/[0.01]">
      <div className="grid grid-cols-4 gap-4 bg-trust-muted/5 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-trust border-b border-trust-muted/10">
        <span>Time</span>
        <span>Actor</span>
        <span>Scope</span>
        <span>Event</span>
      </div>
      <div className="divide-y divide-trust-muted/10">
        {logs.map((log) => (
          <div key={log.id} className="grid grid-cols-4 items-center gap-4 px-6 py-4 text-sm hover:bg-trust-muted/5 transition-colors group">
            <span className="text-slate-500 font-medium whitespace-nowrap">
              {log.at.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
            <span className="font-bold text-slate-900 group-hover:text-trust transition-colors">{log.actor}</span>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                  log.scope === "case"
                    ? "bg-blue-50 text-blue-700 ring-blue-200/50"
                    : "bg-slate-50 text-slate-600 ring-slate-200/50"
                }`}
              >
                {log.scope === "case" ? "Case" : "Template"}
              </span>
            </div>
            <span className="text-slate-600 font-medium leading-relaxed">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="px-6 py-8 text-center text-sm font-medium text-slate-400 italic">No audit events yet.</p>
        )}
      </div>
    </div>
  );
}

export default async function AuditLogsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust">Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Recent changes across cases, templates, and automation.
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <LogsList />
      </Suspense>
    </section>
  );
}

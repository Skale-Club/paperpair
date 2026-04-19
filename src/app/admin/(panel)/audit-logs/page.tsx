import { getAdminAuditLogs } from "@/lib/admin-data";

type LogEntry = {
  id: string;
  at: Date;
  actor: string;
  message: string;
  scope: "case" | "template";
};

export default async function AuditLogsPage() {
  const logs: LogEntry[] = await getAdminAuditLogs();

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand-500">Admin</p>
        <h1 className="text-2xl font-bold text-sand-900">Audit Logs</h1>
        <p className="text-sm text-sand-600">
          Recent changes across cases, templates, and automation.
        </p>
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white">
        <div className="grid grid-cols-4 gap-0 border-b border-sand-200 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-sand-600">
          <span>Time</span>
          <span>Actor</span>
          <span>Scope</span>
          <span>Event</span>
        </div>
        <div className="divide-y divide-sand-100">
          {logs.map((log) => (
            <div key={log.id} className="grid grid-cols-4 items-center gap-2 px-4 py-3 text-sm">
              <span className="text-sand-700">
                {log.at.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
              <span className="font-semibold text-sand-900">{log.actor}</span>
              <span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    log.scope === "case"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {log.scope === "case" ? "Case" : "Template"}
                </span>
              </span>
              <span className="text-sand-800">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="px-4 py-3 text-sm text-sand-600">No audit events yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

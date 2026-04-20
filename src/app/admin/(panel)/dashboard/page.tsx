import Link from "next/link";
import { Suspense } from "react";
import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";
import { getAdminUsersWithCaseSteps } from "@/lib/admin-data";
import { StatsSkeleton, StuckUsersSkeleton } from "@/components/admin-skeletons";

type DerivedStatus = "In Progress" | "Ready for Review" | "Filed";

function deriveStatus(caseSteps: { stepSlug: string; status: string }[]): DerivedStatus {
  const total = DASHBOARD_STEPS.length;
  const completed = caseSteps.filter((s) => s.status === "COMPLETED").length;
  if (completed >= total) return "Filed";
  const review = caseSteps.find((s) => s.stepSlug === "review");
  if (review && (review.status === "IN_PROGRESS" || review.status === "COMPLETED")) {
    return "Ready for Review";
  }
  return "In Progress";
}

function lastActivityAt(
  caseSteps: { updatedAt: Date }[],
  userUpdatedAt: Date
) {
  const latestStep = caseSteps.reduce<Date>((acc, step) => {
    return step.updatedAt > acc ? step.updatedAt : acc;
  }, userUpdatedAt);
  return latestStep;
}

async function AdminStats() {
  const users = await getAdminUsersWithCaseSteps();

  const totalActive = users.length;
  const pendingReview = users.filter((u) => deriveStatus(u.caseSteps) === "Ready for Review").length;
  const docsAttempted = users.filter((u) =>
    u.caseSteps.some((s) => s.stepSlug === "documents")
  );
  const docsSuccess = docsAttempted.filter((u) =>
    u.caseSteps.some((s) => s.stepSlug === "documents" && s.status === "COMPLETED")
  );
  const docSuccessRate =
    docsAttempted.length === 0 ? 0 : Math.round((docsSuccess.length / docsAttempted.length) * 100);
  const newSignups = users.filter((u) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return u.createdAt >= sevenDaysAgo;
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Total Active Cases", value: totalActive },
        { label: "Pending Review", value: pendingReview },
        { label: "Document Success Rate", value: `${docSuccessRate}%` },
        { label: "New Signups (7d)", value: newSignups }
      ].map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-trust-muted/20 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-trust-muted/80">
            {card.label}
          </p>
          <p className="mt-2 text-3xl font-bold text-trust">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

async function StuckUsersList() {
  const users = await getAdminUsersWithCaseSteps();
  const now = new Date();
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  const stuckUsers = users
    .map((u) => {
      const activity = lastActivityAt(u.caseSteps, u.updatedAt);
      return { ...u, lastActivity: activity };
    })
    .filter((u) => u.lastActivity < seventyTwoHoursAgo)
    .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-trust-muted/20 bg-white p-5 border-l-4 border-l-trust shadow-sm h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Stuck Users (72h+)</h2>
          <p className="text-sm text-slate-500 font-medium">
            Reach out before momentum is lost.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm font-bold text-trust hover:underline underline-offset-4"
        >
          Open Users
        </Link>
      </div>

      <div className="mt-4 divide-y divide-trust-muted/20">
        {stuckUsers.length === 0 && (
          <p className="text-sm text-slate-500 py-4 italic">No stuck users right now.</p>
        )}
        {stuckUsers.map((user) => {
          const status = deriveStatus(user.caseSteps);
          const last = user.lastActivity.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          return (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {user.fullName || "User"}
                </p>
                <p className="text-xs text-slate-500 font-medium">Last activity: {last}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200/50">
                  {status}
                </span>
                <form action="/api/admin/users/nudge" method="post">
                  <input type="hidden" name="userId" value={user.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-trust-muted/40 px-3 py-1.5 text-xs font-bold text-trust hover:bg-trust/10 transition-colors"
                  >
                    Send nudge
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">PaperPair Admin</h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Monitor platform health, unblock users, and keep templates current.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/users"
            className="rounded-xl border border-olive-200/50 px-4 py-2 text-sm font-bold text-olive-700 hover:bg-olive-50 transition-colors"
          >
            View Users
          </Link>
          <Link
            href="/admin/documents"
            className="rounded-xl bg-olive-600 px-4 py-2 text-sm font-bold text-white hover:bg-olive-700 shadow-md shadow-olive-900/10 transition-all"
          >
            Manage Templates
          </Link>
        </div>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <AdminStats />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Suspense fallback={<StuckUsersSkeleton />}>
          <StuckUsersList />
        </Suspense>

        <div className="rounded-2xl border border-trust-muted/20 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Quick Links</h2>
          <div className="mt-4 space-y-2 text-sm">
            {[
              { href: "/admin/documents", label: "Manage default templates" },
              { href: "/admin/audit-logs", label: "Review audit logs" },
              { href: "/admin/cms", label: "Edit public pages" },
              { href: "/admin/blogs", label: "Publish blog posts" },
              { href: "/admin/preferences", label: "Open preferences" }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl border border-trust-muted/10 bg-trust-muted/5 px-4 py-3 font-bold text-trust hover:bg-trust/10 hover:border-trust/30 transition-all flex items-center justify-between group"
              >
                <span>{link.label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

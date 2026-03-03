import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";

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

export default async function AdminDashboardPage() {
  let users;
  try {
    users = await prisma.userProfile.findMany({
      where: { role: "USER" },
      include: { caseSteps: true },
      orderBy: { createdAt: "desc" }
    });
  } catch {
    users = [] as Awaited<ReturnType<typeof prisma.userProfile.findMany<{ include: { caseSteps: true } }>>>;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

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
  const newSignups = users.filter((u) => u.createdAt >= sevenDaysAgo).length;

  const stuckUsers = users
    .map((u) => {
      const activity = lastActivityAt(u.caseSteps, u.updatedAt);
      return { ...u, lastActivity: activity };
    })
    .filter((u) => u.lastActivity < seventyTwoHoursAgo)
    .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
    .slice(0, 5);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand-500">Admin</p>
          <h1 className="text-3xl font-bold text-sand-900">Skale Control Center</h1>
          <p className="mt-1 text-sm text-sand-600">
            Monitor platform health, unblock users, and keep templates current.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/users"
            className="rounded-lg border border-sand-300 px-3 py-2 text-sm font-semibold text-sand-900 hover:bg-sand-100"
          >
            View Users
          </Link>
          <Link
            href="/admin/documents"
            className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Manage Templates
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Active Cases", value: totalActive },
          { label: "Pending Review", value: pendingReview },
          { label: "Document Success Rate", value: `${docSuccessRate}%` },
          { label: "New Signups (7d)", value: newSignups }
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sand-500">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-sand-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-sand-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-sand-900">Stuck Users (72h+)</h2>
              <p className="text-sm text-sand-600">
                Reach out before momentum is lost.
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-sm font-semibold text-navy underline"
            >
              Open Users
            </Link>
          </div>

          <div className="mt-3 divide-y divide-sand-100">
            {stuckUsers.length === 0 && (
              <p className="text-sm text-sand-600">No stuck users right now.</p>
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
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-sand-900">
                      {user.fullName || "User"}
                    </p>
                    <p className="text-xs text-sand-600">Last activity: {last}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      {status}
                    </span>
                    <form action="/api/admin/users/nudge" method="post">
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-sand-300 px-3 py-1.5 text-xs font-semibold text-sand-900 hover:bg-sand-100"
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

        <div className="rounded-2xl border border-sand-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-sand-900">Quick Links</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block rounded-lg border border-sand-200 px-3 py-2 hover:border-navy" href="/admin/documents">
              Manage default templates
            </Link>
            <Link className="block rounded-lg border border-sand-200 px-3 py-2 hover:border-navy" href="/admin/audit-logs">
              Review audit logs
            </Link>
            <Link className="block rounded-lg border border-sand-200 px-3 py-2 hover:border-navy" href="/admin/cms">
              Edit public pages
            </Link>
            <Link className="block rounded-lg border border-sand-200 px-3 py-2 hover:border-navy" href="/admin/blogs">
              Publish blog posts
            </Link>
            <Link className="block rounded-lg border border-sand-200 px-3 py-2 hover:border-navy" href="/admin/preferences">
              Open preferences
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

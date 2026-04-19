import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";
import { AdminUsersTable, type UiUser, type DerivedStatus } from "@/components/admin-users-table";
import { getAdminUsersWithCaseSteps } from "@/lib/admin-data";

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

export default async function AdminUsersPage() {
  const users = await getAdminUsersWithCaseSteps();

  const uiUsers: UiUser[] = users.map((user) => {
    const status = deriveStatus(user.caseSteps);
    const completed = user.caseSteps.filter((s) => s.status === "COMPLETED").length;
    const progress = Math.round((completed / DASHBOARD_STEPS.length) * 100);
    const lastActivity = lastActivityAt(user.caseSteps, user.updatedAt);
    return {
      id: user.id,
      name: user.fullName || "User",
      email: user.email,
      status,
      progress,
      lastActivity: lastActivity.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  });

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand-500">Admin</p>
        <h1 className="text-2xl font-bold text-sand-900">Users</h1>
        <p className="text-sm text-sand-600">Search, filter, and drill into any couple.</p>
      </div>

      <AdminUsersTable users={uiUsers} />
    </section>
  );
}

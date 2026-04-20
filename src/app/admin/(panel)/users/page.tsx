import { Suspense } from "react";
import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";
import { AdminUsersTable, type UiUser, type DerivedStatus } from "@/components/admin-users-table";
import { getAdminUsersWithCaseSteps } from "@/lib/admin-data";
import { TableSkeleton } from "@/components/admin-skeletons";

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

async function UsersList() {
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

  return <AdminUsersTable users={uiUsers} />;
}

export default async function AdminUsersPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust">Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 font-medium">Search, filter, and drill into any couple.</p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <UsersList />
      </Suspense>
    </section>
  );
}

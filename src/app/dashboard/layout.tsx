import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";
import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    return (
      <DashboardShell
        completedSteps={0}
        totalSteps={DASHBOARD_STEPS.length}
        previewMode
      >
        {children}
      </DashboardShell>
    );
  }

  const caseSteps = context.userProfile.caseSteps ?? [];
  const totalSteps = DASHBOARD_STEPS.length;
  const completedSteps = caseSteps.filter((s: { status: string }) => s.status === "COMPLETED").length;

  return (
    <DashboardShell completedSteps={completedSteps} totalSteps={totalSteps}>
      {children}
    </DashboardShell>
  );
}

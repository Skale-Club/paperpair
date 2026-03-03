import type { ReactNode } from "react";
import { DashboardTimelineSidebar } from "@/components/dashboard-timeline-sidebar";
import { asStepData } from "@/lib/case-step-data";
import { DASHBOARD_STEPS, type DashboardStepStatus } from "@/lib/dashboard-steps";
import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    return null;
  }

  const { userProfile } = context;

  const stepsWithStatus = DASHBOARD_STEPS.map((step) => {
    const saved = userProfile.caseSteps.find((caseStep: { stepSlug: string }) => caseStep.stepSlug === step.slug);
    return {
      ...step,
      status: (saved?.status ?? "NOT_STARTED") as DashboardStepStatus,
      data: asStepData(saved?.data)
    };
  });

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">My Case</p>
        <h1 className="text-2xl font-bold text-slate-900">Documentation Flow</h1>
        <p className="text-sm text-slate-600">
          Complete each step to prepare your filing packet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[3fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">{children}</div>
        <DashboardTimelineSidebar steps={stepsWithStatus} />
      </div>
    </div>
  );
}

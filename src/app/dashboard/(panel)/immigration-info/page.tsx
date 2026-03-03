import { redirect } from "next/navigation";
import { DashboardStepForm } from "@/components/dashboard-step-form";
import { asStepData } from "@/lib/case-step-data";
import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";

export default async function ImmigrationInfoPage() {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    redirect("/login");
  }

  const stepData = asStepData(
    context.userProfile.caseSteps.find((step) => step.stepSlug === "immigration-info")?.data
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Step 4 of 6</p>
        <h2 className="text-2xl font-semibold text-slate-900">Immigration History</h2>
        <p className="mt-1 text-sm text-slate-600">Entry details and current status.</p>
      </div>

      <DashboardStepForm
        stepSlug="immigration-info"
        nextStepSlug="documents"
        initialData={stepData}
        fields={[
          { name: "entryDateUsa", label: "U.S. entry date", type: "date", required: true },
          {
            name: "i94Number",
            label: "I-94 number",
            type: "text",
            required: true,
            placeholder: "e.g., 1234567890"
          },
          {
            name: "currentStatus",
            label: "Current status",
            type: "text",
            required: true,
            placeholder: "e.g., B2, F1"
          }
        ]}
      />
    </div>
  );
}

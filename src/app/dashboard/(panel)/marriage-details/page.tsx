import { redirect } from "next/navigation";
import { DashboardStepForm } from "@/components/dashboard-step-form";
import { asStepData } from "@/lib/case-step-data";
import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";

export default async function MarriageDetailsPage() {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    redirect("/login");
  }

  const stepData = asStepData(
    context.userProfile.caseSteps.find((step) => step.stepSlug === "marriage-details")?.data
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Step 3 of 6</p>
        <h2 className="text-2xl font-semibold text-slate-900">Marriage Details</h2>
        <p className="mt-1 text-sm text-slate-600">Information about the marriage.</p>
      </div>

      <DashboardStepForm
        stepSlug="marriage-details"
        nextStepSlug="immigration-info"
        initialData={stepData}
        fields={[
          { name: "marriageDate", label: "Marriage date", type: "date", required: true },
          { name: "marriageCity", label: "City", type: "text", required: true },
          { name: "marriageState", label: "State", type: "text", required: true }
        ]}
      />
    </div>
  );
}

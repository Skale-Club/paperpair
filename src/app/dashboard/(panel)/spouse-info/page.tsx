import { redirect } from "next/navigation";
import { DashboardStepForm } from "@/components/dashboard-step-form";
import { asStepData } from "@/lib/case-step-data";
import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";

export default async function SpouseInfoPage() {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    redirect("/login");
  }

  const stepData = asStepData(
    context.userProfile.caseSteps.find((step) => step.stepSlug === "spouse-info")?.data
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Step 2 of 6</p>
        <h2 className="text-2xl font-semibold text-slate-900">Petitioner Information</h2>
        <p className="mt-1 text-sm text-slate-600">Details about the spouse filing the petition.</p>
      </div>

      <DashboardStepForm
        stepSlug="spouse-info"
        nextStepSlug="marriage-details"
        initialData={stepData}
        fields={[
          { name: "spouseFullName", label: "Full name", type: "text", required: true },
          {
            name: "spouseDateOfBirth",
            label: "Date of birth",
            type: "date",
            required: true
          },
          { name: "spouseEmail", label: "Email", type: "email", required: true }
        ]}
      />
    </div>
  );
}

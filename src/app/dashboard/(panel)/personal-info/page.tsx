import { redirect } from "next/navigation";
import { DashboardStepForm } from "@/components/dashboard-step-form";
import { asStepData } from "@/lib/case-step-data";
import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";

export default async function PersonalInfoPage() {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    redirect("/login");
  }

  const stepData = asStepData(
    context.userProfile.caseSteps.find((step) => step.stepSlug === "personal-info")?.data
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Step 1 of 6</p>
        <h2 className="text-2xl font-semibold text-slate-900">Personal Information</h2>
        <p className="mt-1 text-sm text-slate-600">Basic details about the Beneficiary.</p>
      </div>

      <DashboardStepForm
        stepSlug="personal-info"
        nextStepSlug="spouse-info"
        initialData={stepData}
        fields={[
          { name: "fullName", label: "Full name", type: "text", required: true },
          { name: "dateOfBirth", label: "Date of birth", type: "date", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone number", type: "tel", required: true },
          { name: "currentAddress", label: "Current address", type: "text", required: true }
        ]}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { asStepData } from "@/lib/case-step-data";
import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";
import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";

function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}

function formatFieldValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? `${value.length} item(s)` : "No data";
  }

  if (value && typeof value === "object") {
    return "Structured data";
  }

  return "No data";
}

export default async function ReviewPage() {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Step 6 of 6</p>
        <h2 className="text-2xl font-semibold text-slate-900">Final Review</h2>
        <p className="mt-1 text-sm text-slate-600">
          Review the information and, if needed, go back to previous steps to adjust.
        </p>
      </div>

      <div className="space-y-4">
        {DASHBOARD_STEPS.filter((step) => step.slug !== "review").map((step) => {
          const savedStep = context.userProfile.caseSteps.find(
            (caseStep) => caseStep.stepSlug === step.slug
          );
          const data = asStepData(savedStep?.data);
          const entries = Object.entries(data);

          return (
            <div key={step.slug} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                  {savedStep?.status ?? "NOT_STARTED"}
                </span>
              </div>

              {entries.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">No information saved yet.</p>
              ) : (
                <div className="mt-2 space-y-1">
                  {entries.map(([key, value]) => (
                    <p key={key} className="text-sm text-slate-700">
                      <span className="font-medium">{formatFieldLabel(key)}:</span> {formatFieldValue(value)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800">
          Review complete. Use the admin panel to monitor and move the case forward.
            </p>
          </div>
    </div>
  );
}

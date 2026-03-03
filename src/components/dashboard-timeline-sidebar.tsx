"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardStep, DashboardStepStatus } from "@/lib/dashboard-steps";

type StepWithStatus = DashboardStep & {
  status: DashboardStepStatus;
};

export function DashboardTimelineSidebar({ steps }: { steps: StepWithStatus[] }) {
  const pathname = usePathname();

  const getStyles = (step: StepWithStatus, isActive: boolean) => {
    if (isActive) {
      return {
        card: "border-black bg-slate-100",
        dot: "bg-blue-500 ring-4 ring-blue-100",
        line: "bg-blue-300"
      };
    }

    if (step.status === "COMPLETED") {
      return {
        card: "border-green-500 bg-green-50",
        dot: "bg-green-500 ring-4 ring-green-100",
        line: "bg-green-300"
      };
    }

    if (step.critical) {
      return {
        card: "border-red-300 bg-red-50",
        dot: "bg-red-500 ring-4 ring-red-100",
        line: "bg-red-200"
      };
    }

    return {
      card: "border-slate-200 bg-slate-50",
      dot: "bg-slate-300",
      line: "bg-slate-200"
    };
  };

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
        Progress
      </h2>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = pathname === `/dashboard/${step.slug}`;
          const styles = getStyles(step, isActive);

          return (
            <div key={step.slug} className="relative">
              <Link href={`/dashboard/${step.slug}`}>
                <div
                  className={`relative rounded-xl border-2 p-3 transition hover:shadow-sm ${styles.card}`}
                >
                  <div className="absolute left-0 top-1/2 -ml-2 h-4 w-4 -translate-y-1/2 rounded-full">
                    <div className={`h-full w-full rounded-full ${styles.dot}`} />
                  </div>

                  <div className="ml-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Step {step.order}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-xs text-slate-600">{step.description}</p>

                    <div className="mt-2">
                      {step.status === "COMPLETED" && (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Completed
                        </span>
                      )}

                      {step.status === "IN_PROGRESS" && (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          In progress
                        </span>
                      )}

                      {step.status === "NOT_STARTED" && step.critical && (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {index < steps.length - 1 && (
                <div className={`absolute left-2 top-full h-2 w-0.5 ${styles.line}`} />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

import Image from "next/image";

import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";
import { getAdminUsersWithCaseSteps } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await getAdminUsersWithCaseSteps();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand-500">Admin</p>
        <h1 className="text-2xl font-bold text-sand-900">Clients</h1>
        <p className="mt-1 text-sm text-sand-600">{clients.length} clients on file</p>
      </div>

      <div className="space-y-3">
        {clients.length === 0 && (
          <p className="rounded-xl border border-dashed border-sand-300 bg-sand-50 p-8 text-center text-sand-600">
            No clients yet.
          </p>
        )}

        {clients.map((client) => {
          const completedSteps = client.caseSteps.filter((step) => step.status === "COMPLETED").length;
          const totalSteps = DASHBOARD_STEPS.length;
          const progressPercent = Math.round((completedSteps / totalSteps) * 100);

          return (
            <article key={client.id} className="rounded-xl border border-sand-200 bg-white p-4 hover:border-navy">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {client.avatarUrl && (
                    <Image
                      src={client.avatarUrl}
                      alt={client.fullName ?? "Avatar"}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-sand-900">{client.fullName ?? "Beneficiary"}</p>
                    <p className="text-sm text-sand-600">{client.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-sand-900">
                    {completedSteps} / {totalSteps} steps
                  </p>
                  <div className="mt-1 h-2 w-32 rounded-full bg-sand-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {DASHBOARD_STEPS.map((step) => {
                  const caseStep = client.caseSteps.find((savedStep) => savedStep.stepSlug === step.slug);
                  const status = caseStep?.status ?? "NOT_STARTED";

                  return (
                    <span
                      key={step.slug}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-sand-100 text-sand-600"
                        }`}
                    >
                      {step.order}. {step.title}
                    </span>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

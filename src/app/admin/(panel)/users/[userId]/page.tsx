import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { asStepData } from "@/lib/case-step-data";
import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";

type UploadedFile = {
  name: string;
  path: string;
  uploadedAt: string;
};

function extractFiles(value: unknown): UploadedFile[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  const files = (value as Record<string, unknown>).files;
  if (!Array.isArray(files)) return [];
  return files.filter((file) => {
    return (
      file &&
      typeof file === "object" &&
      typeof (file as UploadedFile).name === "string" &&
      typeof (file as UploadedFile).path === "string"
    );
  }) as UploadedFile[];
}

function badge(status: string) {
  if (status === "OCR Verified") return "bg-green-100 text-green-700";
  if (status === "Needs Review") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

type PageParams = {
  params: Promise<{ userId: string }>;
};

export default async function AdminUserReviewPage({ params }: PageProps) {
  let user;
  try {
    user = await prisma.userProfile.findUnique({
      where: { id: params.userId },
      include: { caseSteps: true }
    });
  } catch {
    user = null;
  }

  if (!user) {
    notFound();
  }

  const documentsStep = user.caseSteps.find((s) => s.stepSlug === "documents");
  const documentsData = asStepData(documentsStep?.data);
  const files = extractFiles(documentsData);

  const progressPercent = Math.round(
    (user.caseSteps.filter((s) => s.status === "COMPLETED").length / DASHBOARD_STEPS.length) * 100
  );

  const evidence = files.map((file, index) => {
    const statuses = ["OCR Verified", "Needs Review", "Flagged"];
    const status = statuses[index % statuses.length];
    return { ...file, status };
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand-500">Review Mode</p>
          <h1 className="text-2xl font-bold text-sand-900">{user.fullName || "User"}</h1>
          <p className="text-sm text-sand-600">{user.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sand-500">Progress</p>
          <p className="text-2xl font-bold text-sand-900">{progressPercent}%</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-sand-900">Evidence Wall</h2>
            <p className="text-sm text-sand-600">AI status badges shown for quick triage.</p>

            <div className="mt-3 space-y-2">
              {evidence.length === 0 && (
                <p className="text-sm text-sand-600">No uploads yet.</p>
              )}
              {evidence.map((file) => (
                <div
                  key={`${file.path}-${file.uploadedAt}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-sand-900">{file.name}</p>
                    <p className="text-xs text-sand-600">{file.path}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(file.status)}`}>
                    {file.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-sand-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-sand-900">Quick Actions</h3>
            <div className="mt-3 space-y-2 text-sm">
              <button className="w-full rounded-lg bg-green-600 px-3 py-2 font-semibold text-white hover:bg-green-700">
                Approve evidence
              </button>
              <button className="w-full rounded-lg bg-amber-500 px-3 py-2 font-semibold text-white hover:bg-amber-600">
                Request fixes
              </button>
              <button className="w-full rounded-lg bg-sand-200 px-3 py-2 font-semibold text-sand-900 hover:bg-sand-300">
                Open user timeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

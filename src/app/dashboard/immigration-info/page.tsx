import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";
import { asStepData } from "@/lib/case-step-data";
import { ImmigrationInfoForm } from "./immigration-info-client";

export const dynamic = "force-dynamic";

export default async function ImmigrationInfoPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) {
    redirect("/login");
  }

  const immigrationStep = await prisma.caseStep.findUnique({
    where: {
      userProfileId_stepSlug: {
        userProfileId: context.userProfile.id,
        stepSlug: "immigration-info",
      },
    },
  });

  const stepData = asStepData(immigrationStep?.data);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Case Status</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your receipt numbers and case milestones.
        </p>
      </div>

      <ImmigrationInfoForm existingData={stepData} />
    </div>
  );
}

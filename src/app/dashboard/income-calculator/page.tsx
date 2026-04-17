export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";
import { asStepData } from "@/lib/case-step-data";
import { IncomeCalculatorClient } from "./income-calculator-client";

export default async function IncomeCalculatorPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) redirect("/login");

  const step = await prisma.caseStep.findUnique({
    where: {
      userProfileId_stepSlug: {
        userProfileId: context.userProfile.id,
        stepSlug: "income-calculator",
      },
    },
  });

  const existingData = asStepData(step?.data);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Income Calculator</h1>
      <p className="mb-8 text-sm text-slate-500">
        Verify your household income meets the 125% federal poverty guideline required
        for Form I-864 (Affidavit of Support).
      </p>
      <IncomeCalculatorClient existingData={existingData} />
    </div>
  );
}

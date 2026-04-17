import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { StepStatus } from "@prisma/client";

const FormsSchema = z.object({
  formIds: z.array(z.string()),
});

export async function GET() {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const step = await prisma.caseStep.findUnique({
    where: { userProfileId_stepSlug: { userProfileId: context.userProfile.id, stepSlug: "selected-forms" } },
  });

  const formIds: string[] = step?.data
    ? (step.data as { formIds: string[] }).formIds ?? []
    : [];

  return NextResponse.json({ formIds });
}

export async function POST(request: Request) {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = FormsSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.caseStep.upsert({
    where: { userProfileId_stepSlug: { userProfileId: context.userProfile.id, stepSlug: "selected-forms" } },
    create: { userProfileId: context.userProfile.id, stepSlug: "selected-forms", status: StepStatus.IN_PROGRESS, data: { formIds: body.data.formIds } },
    update: { data: { formIds: body.data.formIds } },
  });

  return NextResponse.json({ ok: true });
}

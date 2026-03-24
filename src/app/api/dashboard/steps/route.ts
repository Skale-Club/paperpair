import { Prisma, StepStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { asStepData } from "@/lib/case-step-data";
import {
  DASHBOARD_STEPS,
  isDashboardStepSlug,
  type DashboardStepSlug
} from "@/lib/dashboard-steps";
import {
  getCurrentUserAndProfile,
  getCurrentUserAndProfileWithCaseSteps
} from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";

const patchSchema = z
  .object({
    stepSlug: z.string().min(1),
    status: z.nativeEnum(StepStatus).optional(),
    data: z.record(z.string(), z.unknown()).optional()
  })
  .superRefine((payload, ctx) => {
    if (!isDashboardStepSlug(payload.stepSlug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid stepSlug"
      });
    }

    if (payload.status === undefined && payload.data === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Send status and/or data"
      });
    }
  });

export async function GET() {
  const context = await getCurrentUserAndProfileWithCaseSteps();

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const steps = DASHBOARD_STEPS.map((step) => {
    const saved = context.userProfile.caseSteps.find((caseStep) => caseStep.stepSlug === step.slug);

    return {
      ...step,
      status: saved?.status ?? "NOT_STARTED",
      data: asStepData(saved?.data)
    };
  });

  return NextResponse.json({ steps });
}

export async function PATCH(request: Request) {
  const context = await getCurrentUserAndProfile();

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { stepSlug, status, data } = parsed.data;

  const updatePayload: Prisma.CaseStepUpdateInput = {};
  if (status) {
    updatePayload.status = status;
  }
  if (data) {
    updatePayload.data = JSON.stringify(data);
  }

  const step = await prisma.caseStep.upsert({
    where: {
      userProfileId_stepSlug: {
        userProfileId: context.userProfile.id,
        stepSlug: stepSlug as DashboardStepSlug
      }
    },
    create: {
      userProfileId: context.userProfile.id,
      stepSlug: stepSlug as DashboardStepSlug,
      status: status ?? StepStatus.IN_PROGRESS,
      data: JSON.stringify(data ?? {})
    },
    update: updatePayload
  });

  return NextResponse.json({ step });
}

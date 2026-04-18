import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { StepStatus } from "@prisma/client";

const TimelineSchema = z.object({
  items: z.record(z.string(), z.boolean()),
});

export async function GET() {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const step = await prisma.caseStep.findUnique({
    where: { userProfileId_stepSlug: { userProfileId: context.userProfile.id, stepSlug: "timeline" } },
  });

  const items: Record<string, boolean> = step?.data
    ? (step.data as Record<string, boolean>)
    : {};

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = TimelineSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.caseStep.upsert({
    where: { userProfileId_stepSlug: { userProfileId: context.userProfile.id, stepSlug: "timeline" } },
    create: { userProfileId: context.userProfile.id, stepSlug: "timeline", status: StepStatus.IN_PROGRESS, data: body.data.items },
    update: { data: body.data.items },
  });

  return NextResponse.json({ ok: true });
}

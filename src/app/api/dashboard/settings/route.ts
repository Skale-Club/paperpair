import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { getUserGoogleApiKey, upsertUserGoogleApiKey } from "@/lib/supabase/user-ai-keys";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  googleApiKey: z.string().nullable().optional(),
  requireBiometricsForSensitiveDocs: z.boolean().optional()
});

export async function GET() {
  const context = await getCurrentUserAndProfile();

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const googleApiKey = await getUserGoogleApiKey(context.user.id);

  const profile = await prisma.userProfile.findUnique({
    where: { authId: context.user.id },
    select: { requireBiometricsForSensitiveDocs: true }
  });

  return NextResponse.json({
    googleApiKey: googleApiKey ? "AIza...hidden" : null,
    requireBiometricsForSensitiveDocs: profile?.requireBiometricsForSensitiveDocs ?? true
  });
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

  const { googleApiKey, requireBiometricsForSensitiveDocs } = parsed.data;

  if (googleApiKey !== undefined) {
    await upsertUserGoogleApiKey(context.user.id, googleApiKey?.trim() || null);
  }

  if (requireBiometricsForSensitiveDocs !== undefined) {
    await prisma.userProfile.update({
      where: { authId: context.user.id },
      data: { requireBiometricsForSensitiveDocs }
    });
  }

  return NextResponse.json({ ok: true });
}


import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  spouseEmail: z.string().email(),
  spouseName: z.string().min(1),
});

export async function POST(request: Request) {
  const context = await getCurrentUserAndProfile();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { spouseEmail, spouseName } = parsed.data;
  const { userProfile } = context;

  // Upsert the invite record (one per primary user)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.spouseInvite.upsert({
    where: { primaryUserId: userProfile.id },
    create: {
      primaryUserId: userProfile.id,
      spouseEmail,
      expiresAt,
    },
    update: {
      spouseEmail,
      expiresAt,
      accepted: false,
    },
  });

  // Resolve site URL with automatic domain discovery so the app works on any
  // domain without code changes:
  //   1. NEXT_PUBLIC_SITE_URL (explicit override)
  //   2. VERCEL_PROJECT_PRODUCTION_URL (auto-populated by Vercel — canonical prod domain)
  //   3. request origin (local dev, preview builds)
  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (vercelProdUrl ? `https://${vercelProdUrl}` : new URL(request.url).origin);
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(spouseEmail, {
    redirectTo: `${siteUrl}/auth/callback?invite_token=${invite.token}`,
    data: {
      full_name: spouseName,
      invite_token: invite.token,
      viewer_of: userProfile.id,
    },
  });

  if (error) {
    console.error("[invite/spouse] Supabase invite error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

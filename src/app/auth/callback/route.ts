import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  try {
    if (code) {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Create/update UserProfile via Prisma
          await prisma.userProfile.upsert({
            where: { authId: user.id },
            create: {
              authId: user.id,
              email: user.email!,
              fullName: user.user_metadata?.full_name ?? null,
              avatarUrl: user.user_metadata?.avatar_url ?? null,
              role: (user.app_metadata?.role === "admin") ? "ADMIN" : "USER"
            },
            update: {
              email: user.email!,
              fullName: user.user_metadata?.full_name ?? null,
              avatarUrl: user.user_metadata?.avatar_url ?? null
            }
          });

          // Redirect by role
          const role = user.app_metadata?.role;
          const dest = role === "admin" ? "/admin/dashboard" : "/dashboard";
          return NextResponse.redirect(new URL(dest, origin));
        }
      }
    }
  } catch (err) {
    console.error("[auth/callback] Unhandled error:", err);
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}

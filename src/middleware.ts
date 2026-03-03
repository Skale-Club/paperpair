import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Guard: skip middleware if Supabase env vars are not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  let supabase, response;
  try {
    const client = createClient(request);
    supabase = client.supabase;
    response = client.response;
  } catch {
    return NextResponse.next();
  }

  // Refresh session
  let user = null;
  let isDbOffline = false;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase is unreachable (e.g. project paused)
    isDbOffline = process.env.NODE_ENV === "development";
  }

  const path = request.nextUrl.pathname;

  // Login page: redirect if authenticated
  if (path === "/login") {
    if (user) {
      const role = (user.app_metadata as { role?: string })?.role;
      const dest = role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return response;
  }

  // Admin routes: require admin role
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!user) {
      if (isDbOffline) return response; // Bypass in dev when DB is paused
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = (user.app_metadata as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/personal-info", request.url));
    }
    return response;
  }

  // Dashboard routes: require authentication
  const protectedPaths = ["/dashboard", "/documentation-filling", "/guide"];
  if (protectedPaths.some((p) => path.startsWith(p))) {
    if (!user) {
      if (isDbOffline) return response; // Bypass in dev when DB is paused
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/documentation-filling/:path*",
    "/guide/:path*",
    "/login"
  ]
};

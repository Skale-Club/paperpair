import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";

export async function POST(request: Request) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Placeholder for future messaging integration (email/SMS/in-app).
  // We simply acknowledge the nudge request for now.
  return NextResponse.json({ ok: true, userId });
}

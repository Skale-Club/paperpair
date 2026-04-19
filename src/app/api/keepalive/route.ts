import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const KEEPALIVE_SECRET = process.env.KEEPALIVE_SECRET;

type CheckResult = { ok: boolean; ms: number; error?: string };

async function checkDatabase(): Promise<CheckResult> {
  const t = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, ms: Date.now() - t };
  } catch (err) {
    return { ok: false, ms: Date.now() - t, error: String(err) };
  }
}

async function checkSupabaseAuth(): Promise<CheckResult> {
  const t = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase env vars");
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    if (error) throw error;
    return { ok: true, ms: Date.now() - t };
  } catch (err) {
    return { ok: false, ms: Date.now() - t, error: String(err) };
  }
}

async function checkStorage(): Promise<CheckResult> {
  const t = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase env vars");
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await supabase.storage.listBuckets();
    if (error) throw error;
    return { ok: true, ms: Date.now() - t };
  } catch (err) {
    return { ok: false, ms: Date.now() - t, error: String(err) };
  }
}

export async function GET(request: Request) {
  // Authenticate the caller
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!KEEPALIVE_SECRET || token !== KEEPALIVE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [database, supabaseAuth, storage] = await Promise.all([
    checkDatabase(),
    checkSupabaseAuth(),
    checkStorage(),
  ]);

  const allOk = database.ok && supabaseAuth.ok && storage.ok;
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      ok: allOk,
      timestamp: new Date().toISOString(),
      checks: { database, supabaseAuth, storage },
    },
    { status }
  );
}

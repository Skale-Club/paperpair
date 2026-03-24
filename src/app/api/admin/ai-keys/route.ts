import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret, decryptSecret } from "@/lib/secret-crypto";

const TABLE = "ai_provider_keys";

async function requireAdmin() {
  const ctx = await getCurrentUserAndProfile();
  if (!ctx || ctx.user.role !== "ADMIN") {
    return null;
  }
  return ctx;
}

// GET - List all provider keys (masked)
export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("provider, is_active, updated_at");

  if (error) {
    return NextResponse.json({ error: "Failed to load keys" }, { status: 500 });
  }

  const providers = (data ?? []).map((row: { provider: string; is_active: boolean; updated_at: string }) => ({
    provider: row.provider,
    isActive: row.is_active,
    updatedAt: row.updated_at,
    hasKey: true,
  }));

  // Add missing providers
  for (const p of ["google", "openai", "openrouter"]) {
    if (!providers.find((x) => x.provider === p)) {
      providers.push({ provider: p, isActive: false, updatedAt: "", hasKey: false });
    }
  }

  return NextResponse.json({ providers });
}

// POST - Save or update a provider key
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { provider, apiKey } = body as { provider?: string; apiKey?: string };

  if (!provider || !apiKey?.trim()) {
    return NextResponse.json({ error: "Missing provider or apiKey" }, { status: 400 });
  }

  if (!["google", "openai", "openrouter"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const encrypted = encryptSecret(apiKey.trim());

  const { error } = await supabase.from(TABLE).upsert(
    {
      provider,
      encrypted_key: encrypted,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider" }
  );

  if (error) {
    return NextResponse.json({ error: "Failed to save key" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE - Remove a provider key
export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { provider } = (await request.json()) as { provider?: string };
  if (!provider) {
    return NextResponse.json({ error: "Missing provider" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).delete().eq("provider", provider);

  if (error) {
    return NextResponse.json({ error: "Failed to delete key" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

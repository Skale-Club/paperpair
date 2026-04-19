import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_ALLOWED_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey || !adminEmail || !adminPassword) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ADMIN_ALLOWED_EMAIL / ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Buckets ──────────────────────────────────────────────────────────────
const wanted = [
  { id: "user-documents", public: false },
  { id: "generated-pdfs", public: false },
];

const { data: existing, error: listErr } = await supabase.storage.listBuckets();
if (listErr) throw listErr;
const existingIds = new Set(existing.map((b) => b.id));

for (const b of wanted) {
  if (existingIds.has(b.id)) {
    console.log(`bucket ${b.id}: already exists`);
    continue;
  }
  const { error } = await supabase.storage.createBucket(b.id, { public: b.public });
  if (error) {
    console.error(`bucket ${b.id}: FAIL`, error.message);
    process.exit(1);
  }
  console.log(`bucket ${b.id}: created (public=${b.public})`);
}

// ─── Admin user ───────────────────────────────────────────────────────────
const { data: list, error: listUserErr } = await supabase.auth.admin.listUsers({ perPage: 200 });
if (listUserErr) throw listUserErr;
const match = list.users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

if (!match) {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (error) throw error;
  console.log(`user ${adminEmail}: created (id=${created.user.id}, role=admin)`);
} else {
  const { data: updated, error } = await supabase.auth.admin.updateUserById(match.id, {
    password: adminPassword,
    email_confirm: true,
    app_metadata: { ...(match.app_metadata ?? {}), role: "admin" },
  });
  if (error) throw error;
  console.log(`user ${adminEmail}: updated (id=${updated.user.id}, role=admin, password reset)`);
}

console.log("\nBootstrap complete.");

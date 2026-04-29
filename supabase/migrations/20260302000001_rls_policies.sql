-- RLS policies for user_profiles and case_steps.
--
-- RLS was enabled on these tables in migration 20260301000000_enable_rls but
-- no policies were defined, leaving the tables unprotected at the database
-- level from direct PostgREST / Supabase JS client queries.
--
-- Note: Prisma always connects via the service role which bypasses RLS.
-- These policies protect against direct Supabase API access.
--
-- Table names use snake_case + plural (standardized in
-- 20260429000001_standardize_table_names.sql). On a fresh DB, Prisma creates
-- the tables under these names directly via @@map, so this migration runs
-- correctly without the rename step.

-- ─── user_profiles ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users read own profile"   ON user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;

-- A user may only read their own row (matched by Supabase auth uid).
CREATE POLICY "Users read own profile"
ON user_profiles FOR SELECT
USING (auth.uid()::text = "authId");

-- A user may only update their own row.
CREATE POLICY "Users update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid()::text = "authId")
WITH CHECK (auth.uid()::text = "authId");

-- INSERT and DELETE are performed server-side via the service role only,
-- so no permissive policies are granted for those operations.

-- ─── case_steps ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users read own case steps"   ON case_steps;
DROP POLICY IF EXISTS "Users write own case steps"  ON case_steps;
DROP POLICY IF EXISTS "Users update own case steps" ON case_steps;
DROP POLICY IF EXISTS "Users delete own case steps" ON case_steps;

-- A user may only read steps that belong to their own profile.
CREATE POLICY "Users read own case steps"
ON case_steps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- A user may only insert steps for their own profile.
CREATE POLICY "Users write own case steps"
ON case_steps FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- A user may only update steps that belong to their own profile.
CREATE POLICY "Users update own case steps"
ON case_steps FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- A user may only delete steps that belong to their own profile.
CREATE POLICY "Users delete own case steps"
ON case_steps FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- ─── page_contents / document_templates ──────────────────────────────────────
-- These tables are managed exclusively by admins via the service role.
-- No policies are granted to authenticated or anon users — RLS enabled with
-- no policy means all non-service-role access is denied by default.
-- All app reads go through server-side Prisma (service role) and bypass RLS.

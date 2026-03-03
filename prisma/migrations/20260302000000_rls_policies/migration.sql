-- RLS policies for UserProfile and CaseStep.
--
-- RLS was enabled on these tables in migration 20260301000000_enable_rls but
-- no policies were defined, leaving the tables unprotected at the database
-- level from direct PostgREST / Supabase JS client queries.
--
-- Note: Prisma always connects via the service role which bypasses RLS.
-- These policies protect against direct Supabase API access.

-- ─── UserProfile ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users read own profile"   ON "UserProfile";
DROP POLICY IF EXISTS "Users update own profile" ON "UserProfile";

-- A user may only read their own row (matched by Supabase auth uid).
CREATE POLICY "Users read own profile"
ON "UserProfile" FOR SELECT
USING (auth.uid()::text = "authId");

-- A user may only update their own row.
CREATE POLICY "Users update own profile"
ON "UserProfile" FOR UPDATE
USING (auth.uid()::text = "authId")
WITH CHECK (auth.uid()::text = "authId");

-- INSERT and DELETE are performed server-side via the service role only,
-- so no permissive policies are granted for those operations.

-- ─── CaseStep ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users read own case steps"   ON "CaseStep";
DROP POLICY IF EXISTS "Users write own case steps"  ON "CaseStep";
DROP POLICY IF EXISTS "Users update own case steps" ON "CaseStep";
DROP POLICY IF EXISTS "Users delete own case steps" ON "CaseStep";

-- A user may only read steps that belong to their own profile.
CREATE POLICY "Users read own case steps"
ON "CaseStep" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- A user may only insert steps for their own profile.
CREATE POLICY "Users write own case steps"
ON "CaseStep" FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- A user may only update steps that belong to their own profile.
CREATE POLICY "Users update own case steps"
ON "CaseStep" FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- A user may only delete steps that belong to their own profile.
CREATE POLICY "Users delete own case steps"
ON "CaseStep" FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- ─── PageContent / DocumentTemplate ──────────────────────────────────────────
-- These tables hold public CMS content and PDF templates managed by admins.
-- They should be readable by all authenticated users but writable only via
-- the service role (admin API routes).

DROP POLICY IF EXISTS "Authenticated users read page content"       ON "PageContent";
DROP POLICY IF EXISTS "Authenticated users read document templates" ON "DocumentTemplate";

CREATE POLICY "Authenticated users read page content"
ON "PageContent" FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users read document templates"
ON "DocumentTemplate" FOR SELECT
TO authenticated
USING (true);

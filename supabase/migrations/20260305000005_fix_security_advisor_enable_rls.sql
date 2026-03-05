-- Ensure RLS is enabled and policies exist for advisor warnings.
-- Idempotent: safe to re-run in prod/stage.

-- ─── UserProfile ─────────────────────────────────────────────────────────────
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile"   ON "UserProfile";
DROP POLICY IF EXISTS "Users update own profile" ON "UserProfile";

CREATE POLICY "Users read own profile"
ON "UserProfile" FOR SELECT
USING (auth.uid()::text = "authId");

CREATE POLICY "Users update own profile"
ON "UserProfile" FOR UPDATE
USING (auth.uid()::text = "authId")
WITH CHECK (auth.uid()::text = "authId");

-- ─── CaseStep ────────────────────────────────────────────────────────────────
ALTER TABLE "CaseStep" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own case steps"   ON "CaseStep";
DROP POLICY IF EXISTS "Users write own case steps"  ON "CaseStep";
DROP POLICY IF EXISTS "Users update own case steps" ON "CaseStep";
DROP POLICY IF EXISTS "Users delete own case steps" ON "CaseStep";

CREATE POLICY "Users read own case steps"
ON "CaseStep" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

CREATE POLICY "Users write own case steps"
ON "CaseStep" FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

CREATE POLICY "Users update own case steps"
ON "CaseStep" FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

CREATE POLICY "Users delete own case steps"
ON "CaseStep" FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "UserProfile" up
    WHERE up.id = "CaseStep"."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- ─── PageContent ─────────────────────────────────────────────────────────────
ALTER TABLE "PageContent" ENABLE ROW LEVEL SECURITY;

-- Deny-by-default for non-service-role. No policies granted.

-- ─── DocumentTemplate ────────────────────────────────────────────────────────
ALTER TABLE "DocumentTemplate" ENABLE ROW LEVEL SECURITY;

-- Deny-by-default for non-service-role. No policies granted.

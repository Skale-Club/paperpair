-- Ensure RLS is enabled and policies exist for advisor warnings.
-- Idempotent: safe to re-run in prod/stage.

-- ─── user_profiles ───────────────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile"   ON user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;

CREATE POLICY "Users read own profile"
ON user_profiles FOR SELECT
USING (auth.uid()::text = "authId");

CREATE POLICY "Users update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid()::text = "authId")
WITH CHECK (auth.uid()::text = "authId");

-- ─── case_steps ──────────────────────────────────────────────────────────────
ALTER TABLE case_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own case steps"   ON case_steps;
DROP POLICY IF EXISTS "Users write own case steps"  ON case_steps;
DROP POLICY IF EXISTS "Users update own case steps" ON case_steps;
DROP POLICY IF EXISTS "Users delete own case steps" ON case_steps;

CREATE POLICY "Users read own case steps"
ON case_steps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

CREATE POLICY "Users write own case steps"
ON case_steps FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

CREATE POLICY "Users update own case steps"
ON case_steps FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

CREATE POLICY "Users delete own case steps"
ON case_steps FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = case_steps."userProfileId"
      AND up."authId" = auth.uid()::text
  )
);

-- ─── page_contents ───────────────────────────────────────────────────────────
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;

-- Deny-by-default for non-service-role. No policies granted.

-- ─── document_templates ──────────────────────────────────────────────────────
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Deny-by-default for non-service-role. No policies granted.

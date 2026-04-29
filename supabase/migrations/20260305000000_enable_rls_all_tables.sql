-- Enable Row Level Security on all public tables that were missing it.
--
-- The Security Advisor flagged these tables because:
--   - "Policy Exists RLS Disabled": case_steps and user_profiles had policies
--     defined but RLS was never actually enabled on them.
--   - "RLS Disabled in Public": page_contents and document_templates had no
--     RLS and no policies.
--
-- Note: Prisma connects via the service role which bypasses RLS entirely,
-- so enabling RLS here only restricts direct Supabase client / PostgREST calls.

-- ─── user_profiles ───────────────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ─── case_steps ──────────────────────────────────────────────────────────────
ALTER TABLE case_steps ENABLE ROW LEVEL SECURITY;

-- ─── page_contents ───────────────────────────────────────────────────────────
-- No policies are granted: all non-service-role (anon/authenticated) access
-- is denied by default. Content is served exclusively through server-side
-- Prisma (service role).
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;

-- ─── document_templates ──────────────────────────────────────────────────────
-- Same rationale as page_contents — admin-managed, service-role only.
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

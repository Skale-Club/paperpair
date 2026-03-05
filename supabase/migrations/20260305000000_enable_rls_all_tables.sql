-- Enable Row Level Security on all public tables that were missing it.
--
-- The Security Advisor flagged these tables because:
--   - "Policy Exists RLS Disabled": CaseStep and UserProfile had policies
--     defined but RLS was never actually enabled on them.
--   - "RLS Disabled in Public": PageContent and DocumentTemplate had no RLS
--     and no policies.
--
-- Note: Prisma connects via the service role which bypasses RLS entirely,
-- so enabling RLS here only restricts direct Supabase client / PostgREST calls.

-- ─── UserProfile ──────────────────────────────────────────────────────────────
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;

-- ─── CaseStep ────────────────────────────────────────────────────────────────
ALTER TABLE "CaseStep" ENABLE ROW LEVEL SECURITY;

-- ─── PageContent ─────────────────────────────────────────────────────────────
-- No policies are granted: all non-service-role (anon/authenticated) access
-- is denied by default. Content is served exclusively through server-side
-- Prisma (service role).
ALTER TABLE "PageContent" ENABLE ROW LEVEL SECURITY;

-- ─── DocumentTemplate ────────────────────────────────────────────────────────
-- Same rationale as PageContent — admin-managed, service-role only.
ALTER TABLE "DocumentTemplate" ENABLE ROW LEVEL SECURITY;

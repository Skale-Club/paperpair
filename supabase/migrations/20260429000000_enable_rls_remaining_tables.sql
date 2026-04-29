-- Standardize RLS across all public tables.
--
-- The Supabase dashboard flagged these tables as "UNRESTRICTED":
--   chat_sessions, chat_messages, documents, spouse_invites,
--   _prisma_migrations.
--
-- All of these are accessed exclusively through Prisma using the service
-- role (bypassing RLS). No client-side Supabase JS / PostgREST queries
-- target them — verified by grepping `.from('<TableName>')` across `src/`.
--
-- Strategy: enable RLS with no policies (deny-by-default for anon and
-- authenticated roles). This matches the established pattern for
-- page_contents and document_templates. Idempotent — safe to re-run.

-- ─── chat_sessions ───────────────────────────────────────────────────────────
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- ─── chat_messages ───────────────────────────────────────────────────────────
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ─── documents ───────────────────────────────────────────────────────────────
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ─── spouse_invites ──────────────────────────────────────────────────────────
ALTER TABLE spouse_invites ENABLE ROW LEVEL SECURITY;

-- ─── _prisma_migrations ──────────────────────────────────────────────────────
-- Prisma's internal migration ledger; only ever touched by `prisma migrate`
-- which connects via the service role. Lock it down for everyone else.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Standardize public table names to snake_case + plural.
--
-- Before this migration the DB had two camps:
--   PascalCase singular (Prisma-managed): UserProfile, CaseStep, ChatSession,
--     ChatMessage, Document, DocumentTemplate, PageContent, SpouseInvite,
--     AiProviderKey
--   snake_case plural (raw SQL): ai_provider_keys, user_ai_keys,
--     webauthn_challenges, webauthn_credentials
--
-- Going forward: snake_case + plural for every public table.
--
-- Idempotent: ALTER TABLE IF EXISTS is a no-op when the old name is gone
-- (e.g. on a fresh DB where Prisma already created the tables under their
-- new @@map'd names).
--
-- The Prisma model `AiProviderKey` is dead code — application reads/writes
-- go to `ai_provider_keys` instead — so the orphan table is dropped here.

-- ─── Drop dead duplicate table ───────────────────────────────────────────────
DROP TABLE IF EXISTS public."AiProviderKey";

-- ─── Rename PascalCase → snake_case plural ───────────────────────────────────
ALTER TABLE IF EXISTS public."UserProfile"      RENAME TO user_profiles;
ALTER TABLE IF EXISTS public."CaseStep"         RENAME TO case_steps;
ALTER TABLE IF EXISTS public."ChatSession"      RENAME TO chat_sessions;
ALTER TABLE IF EXISTS public."ChatMessage"      RENAME TO chat_messages;
ALTER TABLE IF EXISTS public."Document"         RENAME TO documents;
ALTER TABLE IF EXISTS public."DocumentTemplate" RENAME TO document_templates;
ALTER TABLE IF EXISTS public."PageContent"      RENAME TO page_contents;
ALTER TABLE IF EXISTS public."SpouseInvite"     RENAME TO spouse_invites;

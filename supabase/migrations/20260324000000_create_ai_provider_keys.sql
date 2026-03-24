-- Create ai_provider_keys table for platform-level AI provider API keys
-- These are managed by admin and used by the chat assistant

CREATE TABLE IF NOT EXISTS public.ai_provider_keys (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider    TEXT NOT NULL UNIQUE,            -- "google", "openai", "openrouter"
  encrypted_key TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: only service role can access (admin panel uses supabase admin client)
ALTER TABLE public.ai_provider_keys ENABLE ROW LEVEL SECURITY;

-- Deny all direct client access - keys are only accessible via admin client
CREATE POLICY "ai_provider_keys_service_only"
  ON public.ai_provider_keys
  FOR ALL
  USING (false);

-- Index for fast lookups by provider
CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_provider
  ON public.ai_provider_keys (provider)
  WHERE is_active = true;

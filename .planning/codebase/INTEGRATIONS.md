# INTEGRATIONS
_Last updated: 2026-04-17_

## APIs & External Services

**Google Generative AI (Gemini):**
- Used for: primary LLM provider; default model `google/gemini-2.5-flash-lite`; also used directly via REST for structured data extraction from chat transcripts
- SDK/Client: `@ai-sdk/google` (`createGoogleGenerativeAI`) and direct `fetch` to `https://generativelanguage.googleapis.com/v1beta/models/...`
- Auth: Admin-stored encrypted key in DB (table `ai_provider_keys`, provider = `"google"`) OR per-user Google API key stored in Supabase (`user_ai_keys` table, encrypted)
- Models available: `gemini-2.5-flash-lite`, `gemini-2.0-flash`

**OpenAI:**
- Used for: alternative LLM provider; models `gpt-4.1-mini`, `gpt-4.1`
- SDK/Client: `@ai-sdk/openai` (`createOpenAI`)
- Auth: Admin-stored encrypted key in DB (`ai_provider_keys`, provider = `"openai"`)

**OpenRouter:**
- Used for: multi-model proxy; routes to Claude 3.5 Sonnet, Llama 3.1 70B, Mixtral 8x7B
- SDK/Client: `@ai-sdk/openai` with `baseURL: "https://openrouter.ai/api/v1"` and custom headers (`HTTP-Referer: https://paperpair.co`, `X-Title: Paperpair`)
- Auth: Admin-stored encrypted key in DB (`ai_provider_keys`, provider = `"openrouter"`)

**AI Key Management pattern:**
- Provider keys are encrypted at rest using AES-256-GCM via `src/lib/secret-crypto.ts`
- Encryption key derived from `AI_KEYS_ENCRYPTION_SECRET` env var
- Keys cached in-process for 60 seconds (`src/lib/ai/providers.ts`)
- Resolution priority: admin platform key > user's own key

## Data Storage

**Databases:**

Primary relational database — PostgreSQL:
- ORM: Prisma ^6.4.1
- Connection: `POSTGRES_PRISMA_URL` (pooled), `POSTGRES_URL_NON_POOLING` (direct migrations)
- Schema: `prisma/schema.prisma`
- Models: `UserProfile`, `CaseStep`, `SpouseInvite`, `DocumentTemplate`, `PageContent`, `AiProviderKey`
- Migrations: `prisma/migrations/`

Supabase (PostgreSQL + Auth + realtime):
- Used for: user authentication, WebAuthn credential storage (`webauthn_credentials`, `webauthn_challenges` tables), AI provider keys table (`ai_provider_keys` via Supabase client in `src/lib/ai/providers.ts`), user AI key storage
- Client (browser): `createBrowserClient` from `@supabase/ssr` → `src/lib/supabase/client.ts`
- Client (server): `createServerClient` from `@supabase/ssr` → `src/lib/supabase/server.ts`
- Client (admin/service role): `createClient` from `@supabase/supabase-js` → `src/lib/supabase/admin.ts`
- Client (middleware): `src/lib/supabase/middleware.ts`
- Connection: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**File Storage:**
- Generated PDFs: local filesystem at `private/generated/` (server-side, not public)
- PDF templates: `public/` directory (served as static assets)
- No cloud object storage detected

**Caching:**
- In-process memory map for rate limiting (`src/lib/rate-limit.ts`, max 5,000 keys, sliding window)
- In-process cache for AI provider keys (`src/lib/ai/providers.ts`, 60s TTL)
- No Redis or external cache

## Authentication & Identity

**Auth Provider: Supabase Auth**
- Implementation: session managed via cookies (SSR-compatible via `@supabase/ssr`)
- Middleware (`src/middleware.ts`) refreshes session on every request and enforces route protection
- Protected routes: `/dashboard`, `/documentation-filling`, `/guide`, `/admin/*`
- Role system: `admin` vs regular user via `user.app_metadata.role`; admin routes restricted to role = `"admin"`

**Passkeys (WebAuthn):**
- Browser: `@simplewebauthn/browser` ^13.2.2
- Server: `@simplewebauthn/server` ^13.2.3
- API routes:
  - `src/app/api/passkeys/auth/options/route.ts` — generate authentication options
  - `src/app/api/passkeys/auth/verify/route.ts` — verify authentication response
  - `src/app/api/passkeys/register/options/route.ts` — generate registration options
  - `src/app/api/passkeys/register/verify/route.ts` — verify registration response
- Storage: credentials stored in Supabase tables `webauthn_credentials` and `webauthn_challenges`
- Biometrics gate: `UserProfile.requireBiometricsForSensitiveDocs` flag (Prisma model)

**OAuth:**
- Google OAuth supported via Supabase Auth (Google avatar URLs whitelisted in CSP: `https://lh3.googleusercontent.com`)

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Datadog, or similar SDK)

**Logs:**
- Prisma client logs `error` and `warn` levels in production
- `console.*` used in application code for development feedback

**Privacy check script:**
- `scripts/privacy-check.mjs` — custom script, run via `npm run privacy:check`

## CI/CD & Deployment

**Hosting:**
- Vercel (evidenced by `NEXT_PUBLIC_SITE_URL` default `https://paperpaired.vercel.app`, `x-forwarded-proto` header usage, and OpenRouter `HTTP-Referer`)

**CI Pipeline:**
- Not detected (no `.github/workflows/` or similar config found)

**Git hooks:**
- Pre-commit hook at `.githooks/pre-commit`; installed via `npm run hooks:install`

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only, admin operations)
- `POSTGRES_PRISMA_URL` — PostgreSQL pooled connection string (Prisma)
- `POSTGRES_URL_NON_POOLING` — PostgreSQL direct connection string (Prisma migrations)
- `AI_KEYS_ENCRYPTION_SECRET` — Secret for AES-256-GCM encryption of stored AI keys
- `NEXT_PUBLIC_SITE_URL` — Public site URL (e.g., `https://paperpaired.vercel.app`)
- `NEXTAUTH_SECRET` — Auth secret (legacy/reference in example)
- `ADMIN_ALLOWED_EMAIL` — Admin account email (reference in example)

**Secrets location:**
- `.env.local` for local development (gitignored)
- Vercel environment variables for production
- AI provider API keys stored encrypted in the database, not directly in env vars

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook receiver routes found)

**Outgoing:**
- Google Generative AI REST API: direct `fetch` calls from `src/app/api/chat/route.ts` for structured data extraction
- Supabase REST/realtime: via SDK clients throughout `src/lib/supabase/`
- OpenRouter API: via `@ai-sdk/openai` with custom `baseURL`

## Domain-Specific External Data

**USCIS Civil Surgeons:**
- Static dataset embedded in `src/app/api/civil-surgeons/route.ts`
- Source: USCIS Civil Surgeon Locator (verified Feb 2026, Massachusetts only)
- No live API call; dataset is hardcoded and must be manually updated

**Google Generative AI REST (direct fetch):**
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Used for: structured JSON extraction from chat transcripts when a user Google API key is available
- Whitelisted in CSP `connect-src` directive in `next.config.mjs`

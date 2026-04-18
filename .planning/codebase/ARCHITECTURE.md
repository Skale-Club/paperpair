# ARCHITECTURE
_Last updated: 2026-04-17_

## Pattern Overview

**Overall:** Next.js 14+ App Router with a REST-style API layer, Supabase Auth, and Prisma ORM over PostgreSQL.

**Key Characteristics:**
- Server Components are the default for all page rendering; `"use client"` is explicit and limited to interactive UI
- All data mutations go through Next.js Route Handlers under `src/app/api/`
- Auth is Supabase-managed (JWT session via cookies), checked at the Edge in `src/middleware.ts`
- Database access splits between two clients: Prisma (primary CRUD) and Supabase client (storage, auth, WebAuthn tables)
- AI streaming uses Vercel AI SDK (`streamText` + `toUIMessageStreamResponse`)

---

## Layers

**Edge Middleware (`src/middleware.ts`):**
- Purpose: Route-level auth guard before any RSC or API handler runs
- Location: `src/middleware.ts`
- Checks Supabase session via `src/lib/supabase/middleware.ts`
- Protects `/dashboard/**`, `/admin/**`, `/documentation-filling/**`, `/guide/**`, `/login`
- Role-based redirect: `app_metadata.role === "admin"` → `/admin/dashboard`; otherwise `/dashboard`

**Server Components (Pages):**
- Purpose: Fetch-and-render with direct Prisma access; no client-side fetching for initial data
- Location: `src/app/**/page.tsx` and `src/app/**/layout.tsx`
- Entry helper: `getCurrentUserAndProfile()` / `getCurrentUserAndProfileWithCaseSteps()` in `src/lib/current-user-profile.ts`
- Data is passed as props to Client Components (no Context for server data)
- All dashboard pages marked `export const dynamic = "force-dynamic"` to skip caching

**Route Handlers (REST API):**
- Purpose: Mutations, file uploads, AI streaming, and admin operations
- Location: `src/app/api/**/route.ts`
- Auth pattern: every handler calls `getCurrentUserAndProfile()` and returns 401 if null
- Zod used for request body validation (`z.object(...).safeParse(body)`)
- In-memory rate limiter in `src/lib/rate-limit.ts` applied to the `/api/chat` endpoint (30 req/min per IP)

**Library Layer (`src/lib/`):**
- Purpose: Shared utilities consumed by both Server Components and Route Handlers
- Notable modules:
  - `src/lib/current-user-profile.ts` — Supabase auth lookup + Prisma UserProfile upsert
  - `src/lib/prisma.ts` — singleton PrismaClient (global re-use in dev)
  - `src/lib/supabase/server.ts` — SSR Supabase client (cookie-based)
  - `src/lib/supabase/admin.ts` — service-role Supabase client for privileged ops
  - `src/lib/ai/providers.ts` — multi-provider LLM factory (Google, OpenAI, OpenRouter)
  - `src/lib/ai/models.ts` — allowed model registry with `allowedModelIds` Set
  - `src/lib/secret-crypto.ts` — AES-256-GCM encrypt/decrypt for stored AI API keys
  - `src/lib/pdf.ts` — PDF form filling via `pdf-lib`
  - `src/lib/rate-limit.ts` — in-memory sliding-window rate limiter
  - `src/lib/dashboard-steps.ts` — canonical ordered list of 6 case steps
  - `src/lib/cms.ts` — blog/page slug helpers backed by Prisma `PageContent`

**Client Components (`src/components/`):**
- Purpose: Interactive UI; receive server-fetched data as props or fetch from `/api/*` endpoints
- `"use client"` is set per-file, not assumed globally
- Chat UI in `src/components/chat/` uses Vercel AI SDK `useChat` hook to stream from `/api/chat`

---

## Data Flow

**Standard Page Request:**
1. Next.js Edge middleware (`src/middleware.ts`) validates Supabase session cookie
2. Server Component (`src/app/**/page.tsx`) runs on the Node.js runtime
3. Page calls `getCurrentUserAndProfile()` → Supabase `auth.getUser()` → Prisma `userProfile.upsert()`
4. Page renders HTML with embedded data; Client Components hydrate on the browser

**Case Step Mutation:**
1. Client Component submits form or PATCH request to `/api/dashboard/steps`
2. Route Handler validates auth via `getCurrentUserAndProfile()`
3. Zod parses and validates `{ stepSlug, status?, data? }`
4. Prisma `caseStep.upsert()` writes to PostgreSQL with `userProfileId_stepSlug` unique key
5. Response JSON returned; Client Component updates local state

**File Upload:**
1. Client sends `multipart/form-data` to `/api/dashboard/upload`
2. Route Handler validates auth, file type (PDF/JPG/PNG), and size (≤10 MB)
3. File uploaded to Supabase Storage bucket `user-documents` at path `{userId}/{stepSlug}/{timestamp}-{name}`
4. Prisma `caseStep.upsert()` appends file metadata (`{ name, path, uploadedAt }`) to `data.files` JSON array

**AI Chat (Streaming):**
1. Browser sends `POST /api/chat` with `{ messages, selectedModelId, selectedTemplateKeys }`
2. Route Handler checks IP-based rate limit, validates auth
3. Extracts structured data from conversation (Google Gemini JSON extraction or heuristic fallback)
4. If PDF generation requested, fills `pdf-lib` templates and writes to `private/generated/`
5. Builds system prompt with missing field context; calls `streamText()` from Vercel AI SDK
6. Returns `result.toUIMessageStreamResponse()` — a streaming response consumed by the browser `useChat` hook

**Auth Flow (OAuth/Magic Link):**
1. User initiates sign-in (Google OAuth or magic link) via Supabase Auth
2. Supabase redirects to `/auth/callback?code=...` (optionally with `?invite_token=...`)
3. `src/app/auth/callback/route.ts` exchanges the code for a session via `supabase.auth.exchangeCodeForSession()`
4. Prisma `userProfile.upsert()` creates or updates the profile; `viewerOfId` set if a spouse invite token is present
5. Redirect to `/admin/dashboard` (admin role) or `/dashboard` (user role)

**Spouse Invite Flow:**
1. Primary user POSTs to `/api/invite/spouse` with `{ spouseEmail, spouseName }`
2. Prisma creates/updates a `SpouseInvite` record (7-day expiry)
3. Supabase Admin API sends email invite with link `…/auth/callback?invite_token={token}`
4. Spouse clicks link, goes through auth callback, their `UserProfile.viewerOfId` is set to the primary user's profile ID
5. Viewer sessions read-only from the primary user's case data via `getCurrentUserAndProfileWithViewerSupport()`

---

## Key Abstractions

**UserProfile:**
- Purpose: Application-level user record bridging Supabase Auth and Prisma
- Created/updated on every auth check via `userProfile.upsert({ where: { authId } })`
- Contains role (`USER` | `ADMIN`), tier, optional `viewerOfId` for spouse access
- File: `prisma/schema.prisma` model `UserProfile`

**CaseStep:**
- Purpose: Tracks one named step per user with status and arbitrary JSON data
- 6 canonical steps defined in `src/lib/dashboard-steps.ts`: `personal-info`, `spouse-info`, `marriage-details`, `immigration-info`, `documents`, `review`
- Unique key: `(userProfileId, stepSlug)` — upserted, never duplicated
- `data` column stores form answers, uploaded file metadata, etc. as JSON

**AI Provider System:**
- Purpose: Admin-configurable LLM keys stored encrypted in Supabase; user fallback key also supported
- Provider keys encrypted with AES-256-GCM in `src/lib/secret-crypto.ts`; stored in `ai_provider_keys` Supabase table
- `src/lib/ai/providers.ts` fetches keys (1-min in-memory cache), selects provider by `{provider}/{model}` ID format
- Supported providers: `google`, `openai`, `openrouter`

**PageContent (CMS):**
- Purpose: Admin-editable public page content stored in PostgreSQL
- Prisma model `PageContent` with `slug` as unique key
- Admin edits via `/admin/cms`; public pages (`/home`, `/contact`, `/blogs`) read at request time

---

## Entry Points

**Root (`src/app/page.tsx`):**
- Immediate `redirect("/home")` — no rendering

**Root Layout (`src/app/layout.tsx`):**
- Wraps all routes in `<Providers>` (LanguageProvider) and `<ConditionalShell>` (conditional navbar)

**Dashboard Layout (`src/app/dashboard/layout.tsx`):**
- Server Component; fetches case step progress and renders `<DashboardShell>` with sidebar and step count

**Admin Layout (`src/app/admin/(panel)/layout.tsx`):**
- Renders admin sidebar and panel shell; middleware already enforces admin role before this runs

---

## Error Handling

**Strategy:** Fail-safe with explicit JSON error responses; never expose internal details

**Patterns:**
- Route Handlers return `{ error: string }` with appropriate HTTP status codes (400, 401, 403, 429, 500)
- `getCurrentUserAndProfile()` returns `null` on auth failure; callers check and return 401
- Prisma errors in Server Components are caught with `try/catch`; pages render empty state rather than crashing
- AI provider failures return a 400 with a human-readable message shown in the chat UI
- Rate limit exhaustion returns 429 with `Retry-After` header

---

## Cross-Cutting Concerns

**Logging:** `console.error` used selectively in Route Handlers for unexpected errors (not in normal 4xx paths)
**Validation:** Zod at every Route Handler boundary for request bodies
**Authentication:** `getCurrentUserAndProfile()` called at the top of every Route Handler; middleware provides a second layer
**Security Headers:** Defined in `next.config.mjs` — CSP, HSTS, X-Frame-Options DENY, no geolocation
**Rate Limiting:** In-memory sliding window in `src/lib/rate-limit.ts` applied per-IP to `/api/chat`
**Encryption:** AES-256-GCM used for AI provider API keys stored in the database (`src/lib/secret-crypto.ts`)

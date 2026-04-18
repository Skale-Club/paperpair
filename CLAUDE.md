<!-- GSD:project-start source:PROJECT.md -->
## Project

**PaperPair**

PaperPair is a guided immigration document assistant for couples going through a marriage-based green card (Adjustment of Status) in the U.S. It walks the beneficiary and petitioner step-by-step through every form, document, and action required — from eligibility check through interview and approval — with checklist tracking, AI-assisted chat, and PDF form previews.

**Core Value:** The applicant always knows exactly what to do next — no confusion, no missed steps, no wasted trips to the USCIS website.

### Constraints

- **Tech stack:** Next.js 15 + Supabase + Prisma — must stay within this stack
- **AOS only:** All content and flow is scoped to marriage-based Adjustment of Status for now
- **Vercel deployment:** App targets Vercel hosting; avoid long-running server processes
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.7.3 — All application code (strict mode, `noEmit`, target ES2022)
- CSS (via Tailwind utility classes only; no raw CSS files beyond `src/app/globals.css`)
## Runtime
- Node.js (LTS) — server-side rendering, API routes, scripts
- Browser — client components, WebAuthn browser APIs
- npm (lockfile: `package-lock.json` present)
## Frameworks
- Next.js ^15.5.14 — App Router, Server Actions (10 MB body limit), React Server Components
- React 19.2.4 / React DOM 19.2.4 — UI layer
- Tailwind CSS ^3.4.17 — utility-first CSS; config at `tailwind.config.ts`
- PostCSS ^8.5.1 — Tailwind processing; config at `postcss.config.mjs`
- clsx ^2.1.1 — conditional class composition
- tailwind-merge ^3.5.0 — merge conflicting Tailwind classes
- Vitest ^4.1.1 — test runner; config at `vitest.config.ts`
- @testing-library/react ^16.3.2 — component testing
- @testing-library/jest-dom ^6.9.1 — DOM matchers
- jsdom ^29.0.1 — browser environment simulation for tests
- TypeScript compiler (via Next.js build pipeline; `next build` runs `prisma generate` first)
- ESLint ^8.57.1 + eslint-config-next ^15.5.14 — linting
## Key Dependencies
- ai ^6.0.137 (Vercel AI SDK core) — `streamText`, `UIMessage` streaming, `toUIMessageStreamResponse`
- @ai-sdk/google ^3.0.53 — Google Gemini provider (`createGoogleGenerativeAI`)
- @ai-sdk/openai ^3.0.48 — OpenAI + OpenRouter provider (`createOpenAI`)
- @ai-sdk/react ^3.0.139 — React hooks for streaming chat UI (`useChat`)
- @prisma/client ^6.4.1 — type-safe database client
- prisma ^6.4.1 (dev) — CLI for migrations and schema management
- @supabase/supabase-js ^2.97.0 — direct Supabase client (admin operations)
- @supabase/ssr ^0.8.0 — SSR-safe browser/server client creation
- @simplewebauthn/browser ^13.2.2 — WebAuthn passkey browser-side flows
- @simplewebauthn/server ^13.2.3 — WebAuthn passkey server-side verification
- Node.js built-in `crypto` — AES-256-GCM encryption for stored AI provider keys
- pdf-lib ^1.17.1 — fill and flatten AcroForm fields in USCIS PDF templates
- pdfjs-dist ^5.5.207 — PDF preview rendering in browser (requires `canvas` property in render params for v5)
- zod ^4.3.6 — request body validation in API routes
## Configuration
- `.env.example` documents required vars (see INTEGRATIONS.md for full list)
- `.env.local` — local overrides (gitignored)
- Key configs required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `AI_KEYS_ENCRYPTION_SECRET`
- `next.config.mjs` — security headers (CSP, HSTS, X-Frame-Options, etc.), 10 MB server action body limit
- `tsconfig.json` — path alias `@/*` → `./src/*`, strict mode, bundler module resolution
- `tailwind.config.ts` — custom color palette (sand, olive, navy)
- `vitest.config.ts` — jsdom environment, global test APIs, `@/` alias, v8 coverage provider
## Platform Requirements
- Node.js LTS
- Supabase CLI (`supabase` ^2.76.14 dev dep) for local Supabase instance
- Prisma CLI for migrations (`npm run prisma:migrate`)
- Deployed on Vercel (referenced in `NEXT_PUBLIC_SITE_URL` default and OpenRouter `HTTP-Referer` header)
- PostgreSQL database (Vercel Postgres or compatible); connection via `POSTGRES_PRISMA_URL` (pooled) and `POSTGRES_URL_NON_POOLING` (direct)
- Supabase project for auth and storage
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Language & Toolchain
- **TypeScript** (strict mode, `"strict": true` in `tsconfig.json`) — `allowJs: false`, so no plain JS files in `src/`
- Target: `ES2022`; module resolution: `bundler`
- Path alias: `@/*` maps to `src/*` — use `@/` for all internal imports
- ESLint: `next/core-web-vitals` + `next/typescript` (configured in `.eslintrc.json`)
- No Prettier config present — formatting is unenforced beyond ESLint rules
## File Naming
- **Source files**: `kebab-case` for all filenames: `dashboard-shell.tsx`, `rate-limit.ts`, `fee-schedule.ts`
- **React component files**: `.tsx` extension; same kebab-case naming: `case-health-topbar.tsx`
- **Route files**: Next.js App Router conventions (`page.tsx`, `route.ts`, `layout.tsx`)
- **Test files**: `*.test.ts` or `*.test.tsx`, placed in `src/__tests__/` (not co-located)
- **Type-only files**: placed in `src/types/` (e.g., `src/types/supabase.ts`)
## Directory Layout Conventions
## Naming Patterns
## Import Conventions
## React Component Patterns
## TypeScript Patterns
## API Route Conventions
- Handler functions named by HTTP method: `GET`, `POST`, `PATCH`, `DELETE`
- Always validate request bodies with Zod before processing
- Return `NextResponse.json({ error: "..." }, { status: NNN })` for errors
- Auth check first, return 401 immediately if no session:
## Error Handling
- `try/catch` with empty `catch {}` used sparingly (only in Prisma upsert paths where a null return is acceptable)
- Errors from supabase/auth destructured with aliases to avoid shadowing: `const { error: signInError } = await ...`
- Rate limiting via `src/lib/rate-limit.ts` applied on sensitive API routes
## Styling
- Tailwind CSS utility classes; no CSS modules or styled-components
- `cn()` utility from `src/lib/utils.ts` for conditional class merging (`clsx` + `tailwind-merge`)
- Inline `style` props only for CSS variables: `style={{ background: "var(--color-bg)" }}`
- No global CSS beyond Tailwind base/utilities
## Module-Level Comments
- Module-level JSDoc block at top of complex lib files: `/** @module fee-schedule */`
- Inline `/** ... */` comments above each exported constant in `fee-schedule.ts`
- Regular `//` line comments inside function bodies for section explanations
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server Components are the default for all page rendering; `"use client"` is explicit and limited to interactive UI
- All data mutations go through Next.js Route Handlers under `src/app/api/`
- Auth is Supabase-managed (JWT session via cookies), checked at the Edge in `src/middleware.ts`
- Database access splits between two clients: Prisma (primary CRUD) and Supabase client (storage, auth, WebAuthn tables)
- AI streaming uses Vercel AI SDK (`streamText` + `toUIMessageStreamResponse`)
## Layers
- Purpose: Route-level auth guard before any RSC or API handler runs
- Location: `src/middleware.ts`
- Checks Supabase session via `src/lib/supabase/middleware.ts`
- Protects `/dashboard/**`, `/admin/**`, `/documentation-filling/**`, `/guide/**`, `/login`
- Role-based redirect: `app_metadata.role === "admin"` → `/admin/dashboard`; otherwise `/dashboard`
- Purpose: Fetch-and-render with direct Prisma access; no client-side fetching for initial data
- Location: `src/app/**/page.tsx` and `src/app/**/layout.tsx`
- Entry helper: `getCurrentUserAndProfile()` / `getCurrentUserAndProfileWithCaseSteps()` in `src/lib/current-user-profile.ts`
- Data is passed as props to Client Components (no Context for server data)
- All dashboard pages marked `export const dynamic = "force-dynamic"` to skip caching
- Purpose: Mutations, file uploads, AI streaming, and admin operations
- Location: `src/app/api/**/route.ts`
- Auth pattern: every handler calls `getCurrentUserAndProfile()` and returns 401 if null
- Zod used for request body validation (`z.object(...).safeParse(body)`)
- In-memory rate limiter in `src/lib/rate-limit.ts` applied to the `/api/chat` endpoint (30 req/min per IP)
- Purpose: Shared utilities consumed by both Server Components and Route Handlers
- Notable modules:
- Purpose: Interactive UI; receive server-fetched data as props or fetch from `/api/*` endpoints
- `"use client"` is set per-file, not assumed globally
- Chat UI in `src/components/chat/` uses Vercel AI SDK `useChat` hook to stream from `/api/chat`
## Data Flow
## Key Abstractions
- Purpose: Application-level user record bridging Supabase Auth and Prisma
- Created/updated on every auth check via `userProfile.upsert({ where: { authId } })`
- Contains role (`USER` | `ADMIN`), tier, optional `viewerOfId` for spouse access
- File: `prisma/schema.prisma` model `UserProfile`
- Purpose: Tracks one named step per user with status and arbitrary JSON data
- 6 canonical steps defined in `src/lib/dashboard-steps.ts`: `personal-info`, `spouse-info`, `marriage-details`, `immigration-info`, `documents`, `review`
- Unique key: `(userProfileId, stepSlug)` — upserted, never duplicated
- `data` column stores form answers, uploaded file metadata, etc. as JSON
- Purpose: Admin-configurable LLM keys stored encrypted in Supabase; user fallback key also supported
- Provider keys encrypted with AES-256-GCM in `src/lib/secret-crypto.ts`; stored in `ai_provider_keys` Supabase table
- `src/lib/ai/providers.ts` fetches keys (1-min in-memory cache), selects provider by `{provider}/{model}` ID format
- Supported providers: `google`, `openai`, `openrouter`
- Purpose: Admin-editable public page content stored in PostgreSQL
- Prisma model `PageContent` with `slug` as unique key
- Admin edits via `/admin/cms`; public pages (`/home`, `/contact`, `/blogs`) read at request time
## Entry Points
- Immediate `redirect("/home")` — no rendering
- Wraps all routes in `<Providers>` (LanguageProvider) and `<ConditionalShell>` (conditional navbar)
- Server Component; fetches case step progress and renders `<DashboardShell>` with sidebar and step count
- Renders admin sidebar and panel shell; middleware already enforces admin role before this runs
## Error Handling
- Route Handlers return `{ error: string }` with appropriate HTTP status codes (400, 401, 403, 429, 500)
- `getCurrentUserAndProfile()` returns `null` on auth failure; callers check and return 401
- Prisma errors in Server Components are caught with `try/catch`; pages render empty state rather than crashing
- AI provider failures return a 400 with a human-readable message shown in the chat UI
- Rate limit exhaustion returns 429 with `Retry-After` header
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

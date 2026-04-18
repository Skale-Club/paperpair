# STACK
_Last updated: 2026-04-17_

## Languages

**Primary:**
- TypeScript 5.7.3 — All application code (strict mode, `noEmit`, target ES2022)

**Secondary:**
- CSS (via Tailwind utility classes only; no raw CSS files beyond `src/app/globals.css`)

## Runtime

**Environment:**
- Node.js (LTS) — server-side rendering, API routes, scripts
- Browser — client components, WebAuthn browser APIs

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- Next.js ^15.5.14 — App Router, Server Actions (10 MB body limit), React Server Components
- React 19.2.4 / React DOM 19.2.4 — UI layer

**Styling:**
- Tailwind CSS ^3.4.17 — utility-first CSS; config at `tailwind.config.ts`
- PostCSS ^8.5.1 — Tailwind processing; config at `postcss.config.mjs`
- clsx ^2.1.1 — conditional class composition
- tailwind-merge ^3.5.0 — merge conflicting Tailwind classes

**Testing:**
- Vitest ^4.1.1 — test runner; config at `vitest.config.ts`
- @testing-library/react ^16.3.2 — component testing
- @testing-library/jest-dom ^6.9.1 — DOM matchers
- jsdom ^29.0.1 — browser environment simulation for tests

**Build / Dev:**
- TypeScript compiler (via Next.js build pipeline; `next build` runs `prisma generate` first)
- ESLint ^8.57.1 + eslint-config-next ^15.5.14 — linting

## Key Dependencies

**AI / LLM:**
- ai ^6.0.137 (Vercel AI SDK core) — `streamText`, `UIMessage` streaming, `toUIMessageStreamResponse`
- @ai-sdk/google ^3.0.53 — Google Gemini provider (`createGoogleGenerativeAI`)
- @ai-sdk/openai ^3.0.48 — OpenAI + OpenRouter provider (`createOpenAI`)
- @ai-sdk/react ^3.0.139 — React hooks for streaming chat UI (`useChat`)

**Database ORM:**
- @prisma/client ^6.4.1 — type-safe database client
- prisma ^6.4.1 (dev) — CLI for migrations and schema management

**Supabase:**
- @supabase/supabase-js ^2.97.0 — direct Supabase client (admin operations)
- @supabase/ssr ^0.8.0 — SSR-safe browser/server client creation

**Authentication / Security:**
- @simplewebauthn/browser ^13.2.2 — WebAuthn passkey browser-side flows
- @simplewebauthn/server ^13.2.3 — WebAuthn passkey server-side verification
- Node.js built-in `crypto` — AES-256-GCM encryption for stored AI provider keys

**PDF:**
- pdf-lib ^1.17.1 — fill and flatten AcroForm fields in USCIS PDF templates
- pdfjs-dist ^5.5.207 — PDF preview rendering in browser (requires `canvas` property in render params for v5)

**Validation:**
- zod ^4.3.6 — request body validation in API routes

## Configuration

**Environment:**
- `.env.example` documents required vars (see INTEGRATIONS.md for full list)
- `.env.local` — local overrides (gitignored)
- Key configs required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `AI_KEYS_ENCRYPTION_SECRET`

**Build:**
- `next.config.mjs` — security headers (CSP, HSTS, X-Frame-Options, etc.), 10 MB server action body limit
- `tsconfig.json` — path alias `@/*` → `./src/*`, strict mode, bundler module resolution
- `tailwind.config.ts` — custom color palette (sand, olive, navy)
- `vitest.config.ts` — jsdom environment, global test APIs, `@/` alias, v8 coverage provider

## Platform Requirements

**Development:**
- Node.js LTS
- Supabase CLI (`supabase` ^2.76.14 dev dep) for local Supabase instance
- Prisma CLI for migrations (`npm run prisma:migrate`)

**Production:**
- Deployed on Vercel (referenced in `NEXT_PUBLIC_SITE_URL` default and OpenRouter `HTTP-Referer` header)
- PostgreSQL database (Vercel Postgres or compatible); connection via `POSTGRES_PRISMA_URL` (pooled) and `POSTGRES_URL_NON_POOLING` (direct)
- Supabase project for auth and storage

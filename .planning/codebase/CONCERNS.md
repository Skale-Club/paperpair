# CONCERNS
_Last updated: 2026-04-17_

---

## Tech Debt

### Duplicate PDF generation logic
- Issue: `generatePdfs` is implemented in two places with near-identical code
- Files: `src/app/api/chat/route.ts` (lines 172–207) and `src/lib/ai/tools/generate-pdfs.ts`
- Impact: Bug fixes or behavioral changes must be applied to both; easy to drift out of sync
- Fix approach: Remove the inline `generatePdfs` function in `route.ts` and import the canonical version from `src/lib/ai/tools/generate-pdfs.ts`

### User profile is upserted on every authenticated request
- Issue: `getCurrentUserAndProfile` and `getCurrentUserAndProfileWithCaseSteps` in `src/lib/current-user-profile.ts` call `prisma.userProfile.upsert` on every invocation, including on every API call
- Impact: Unnecessary write operations on every request; adds latency and Prisma connection pressure
- Fix approach: Replace the upsert with a `findUnique` for most calls; only upsert in the auth callback (`src/app/auth/callback/route.ts`) or after OAuth sign-in

### In-memory rate limiter does not survive restarts or scale horizontally
- Issue: `src/lib/rate-limit.ts` stores rate limit state in `globalThis` as an in-process Map
- Impact: Rate limit state is lost on every serverless cold start; provides no protection in multi-instance deployments (Vercel edge functions, scale-out); a burst from one instance is invisible to others
- Fix approach: Replace with Redis (Upstash) or a Supabase-backed counter; or use Vercel's built-in rate limiting if available

### Admin nudge endpoint is a stub
- Issue: `src/app/api/admin/users/nudge/route.ts` returns `{ ok: true }` without sending any message (email/SMS/in-app)
- Files: `src/app/api/admin/users/nudge/route.ts`
- Impact: Admin UI exposes a "nudge" action that does nothing; silent failure
- Fix approach: Integrate an email provider (e.g. Resend, SendGrid) to send a real notification and remove the placeholder comment

### Civil surgeon data is hardcoded to Massachusetts only
- Issue: `src/app/api/civil-surgeons/route.ts` contains a static list of 5 civil surgeons in MA; all zip codes return the same list regardless of state
- Impact: Users outside MA receive wrong/irrelevant results; this silently provides incorrect guidance
- Fix approach: Integrate USCIS Civil Surgeon Locator API, or at minimum expand the dataset and add zip-to-state routing

### PDF template files stored in `public/uploads/` (publicly accessible)
- Issue: Admin-uploaded PDF templates are written to `public/uploads/` via `src/app/api/admin/documents/route.ts`; Next.js serves everything under `public/` without authentication
- Impact: USCIS form templates (including field mapping JSON with `.meta.json`) are readable by anyone with the URL
- Fix approach: Move uploads to a non-public directory (e.g. `private/uploads/`) and serve them through an authenticated API route, similar to how generated PDFs are served via `/api/dashboard/pdf/[filename]`

### `private/generated/` PDFs are local filesystem files on the server
- Issue: Generated PDFs are written to `private/generated/` on the server filesystem (`src/app/api/chat/route.ts`, `src/lib/ai/tools/generate-pdfs.ts`)
- Impact: On serverless deployments (Vercel), the filesystem is ephemeral; files disappear between function invocations; downloads will fail after a cold start. Old generated files also accumulate with no cleanup
- Fix approach: Upload generated PDFs to Supabase Storage and return a signed URL; eliminate the local filesystem dependency

### Document template metadata stored split across DB and filesystem
- Issue: `DocumentTemplate` records live in Prisma/Postgres, but their field mapping and edition data live as `.meta.json` files on the filesystem (`public/uploads/<key>.meta.json`)
- Files: `src/app/api/admin/documents/route.ts`, `prisma/schema.prisma`
- Impact: Dual-source-of-truth; metadata is invisible to database queries; inconsistency possible if filesystem is reset (serverless); not queryable
- Fix approach: Add `mapping`, `edition`, `category`, and `mandatory` columns to the `DocumentTemplate` Prisma model and migrate existing `.meta.json` data into the database

### `parseHeuristic` is a very shallow fallback for data extraction
- Issue: `parseHeuristic` in `src/app/api/chat/route.ts` extracts only email and phone with regex; all other required fields (name, address, DOB, etc.) are left empty
- Impact: When no Google API key is configured, PDF generation produces nearly empty forms; the user gets a silently degraded experience
- Fix approach: Document clearly that the AI API key is required for PDF generation; show an error or warning in the UI when no key is configured; or remove the heuristic path entirely

### Theme and language settings in settings page have no persistence
- Issue: `src/app/dashboard/settings/page.tsx` has `useState` for `theme` and `language` but these are never saved or loaded; the fields are UI-only dead code
- Impact: Misleads users into thinking theme/language preferences are being saved
- Fix approach: Either wire the settings to a real API (add columns to `UserProfile`) or remove the UI elements until the feature is implemented

---

## Security Considerations

### Admin role is enforced only at application layer, not consistently at DB layer
- Issue: Admin access to sensitive routes (`/api/admin/*`) relies on `isAdminSession()` from `src/lib/admin.ts`, which checks `user.app_metadata.role`. Prisma always uses the service role and bypasses RLS entirely
- Files: `src/lib/admin.ts`, `src/lib/current-user-profile.ts`
- Current mitigation: Application-layer checks exist on all admin endpoints
- Recommendations: This is acceptable if all DB writes go through server-side Prisma, but there is no defense-in-depth at the database layer for admin tables (`PageContent`, `DocumentTemplate`). Consider adding admin-only RLS policies as a backstop

### User-supplied `googleApiKey` is validated only for format (string), not authenticity
- Issue: `src/app/api/dashboard/settings/route.ts` accepts any non-empty string as a Google API key; no attempt is made to verify it works before storing it
- Impact: A user can store a deliberately bad key; the error surfaces only at chat time with a confusing provider error message
- Fix approach: Optionally call a cheap Google API endpoint to validate the key before storing it

### PDF filename ownership check is name-prefix based
- Issue: `src/app/api/dashboard/pdf/[filename]/route.ts` validates that `filename.startsWith(context.user.id + "-")`; a user ID is a cuid which is not secret but is relatively hard to guess
- Current mitigation: Auth is required; filename must match `/^[\w.-]+\.pdf$/`
- Recommendations: This is low risk but not cryptographically enforced. Consider adding a short HMAC or random token to filenames to make them unforgeable

### `x-forwarded-for` header used for rate limit key without validation
- Issue: `src/lib/rate-limit.ts` uses the first IP in `x-forwarded-for` as the rate limit key; this header is user-controllable without a trusted proxy
- Impact: An attacker can send arbitrary `x-forwarded-for` values to bypass rate limits (e.g. rotate fake IPs)
- Fix approach: Configure the number of trusted proxies and only read the IP at that offset, or switch to a server-managed IP extraction (Vercel provides `x-real-ip` which is set by their infrastructure)

### OpenAPI spec exposed without authentication
- Issue: `src/app/api/docs/route.ts` returns a full OpenAPI spec with `Access-Control-Allow-Origin: *` and no auth check
- Impact: Documents internal API structure to anyone; minor information disclosure
- Fix approach: Gate behind admin session or at minimum remove from production; or keep it intentionally public (document the decision)

### Avatar file extension is taken directly from the uploaded filename
- Issue: `src/app/api/profile/avatar/route.ts` uses `file.name.split(".").pop()` to determine the storage path extension without checking it against the allowed MIME type
- Impact: A file named `malicious.jpg.php` would be stored with extension `php`; while Supabase storage serves files with correct Content-Type (not executing them), this still stores unexpected filenames
- Fix approach: Derive the extension from the validated MIME type (`image/jpeg` → `jpg`, etc.) rather than from the filename

---

## Performance Bottlenecks

### Admin dashboard loads all users with all case steps in a single query
- Issue: `src/app/admin/(panel)/dashboard/page.tsx` and `src/app/admin/(panel)/users/page.tsx` both call `prisma.userProfile.findMany({ include: { caseSteps: true } })` with no pagination
- Impact: As user count grows, this becomes very slow and memory-intensive; the entire dataset is transferred to compute the aggregated stats
- Fix approach: Add cursor-based or offset pagination to the users list; compute aggregate stats via database aggregation queries rather than loading all rows

### `GET /api/admin/documents` performs N+1 filesystem reads
- Issue: `src/app/api/admin/documents/route.ts` fetches all document templates from Prisma then calls `readMeta(doc.key)` for each in a `Promise.all`; each call reads a `.meta.json` file from the filesystem
- Impact: N filesystem reads per request; fails gracefully but becomes slow as template count grows; doubly broken on serverless where the filesystem resets
- Fix approach: Store metadata in the database (see tech debt item above); eliminates the filesystem reads entirely

### No HTTP caching on any API route
- Issue: No API routes set cache headers (`Cache-Control`, `ETag`) for GET responses that could benefit from caching (e.g. `/api/dashboard/steps`, `/api/civil-surgeons`)
- Impact: Every page load makes full roundtrips to the database even for data that has not changed
- Fix approach: Add `Cache-Control: private, max-age=60` on appropriate GET routes; consider SWR patterns already used client-side

### AI provider key cached in memory with 60-second TTL only per instance
- Issue: `src/lib/ai/providers.ts` caches the admin AI provider keys in a module-level variable with a 60-second TTL
- Impact: In serverless, each function instance has its own cache; every cold start triggers a full Supabase query; no cross-instance sharing
- Fix approach: Use Vercel's Data Cache or an external cache (Redis/Upstash) for shared key caching

---

## Fragile Areas

### `CaseStep.data` is untyped JSON
- Files: `prisma/schema.prisma` (the `data Json` field on `CaseStep`), `src/lib/case-step-data.ts`
- Why fragile: All step-specific data is stored as an opaque JSON blob; there are no Prisma-level type constraints; consumer code casts fields with `as string | undefined` throughout (e.g. `src/app/dashboard/page.tsx` lines 40–53)
- Safe modification: Always go through `asStepData()` from `src/lib/case-step-data.ts`; add Zod schemas per step slug to validate shape before reading/writing
- Test coverage: No tests for the step data parsing logic

### PDF field mapping is string-key-based with silent failures
- Files: `src/lib/pdf.ts` (`fillPdfTemplate`), `src/lib/ai/tools/generate-pdfs.ts`
- Why fragile: If a PDF field name in the template does not match the key in the data map, the field is silently skipped; there is no validation that the mapping produces a correctly filled form
- Safe modification: Add a dry-run mode that reports unmatched fields; test against a real fixture PDF
- Test coverage: `src/__tests__/lib/pdf.test.ts` tests `lockFormEdition` and `sanitizeField` but does not test actual PDF field filling

### Spouse viewer linking has no authorization check after accept
- Files: `src/app/auth/callback/route.ts`, `src/lib/current-user-profile.ts`
- Why fragile: Once a spouse invite is accepted and `viewerOfId` is set on a `UserProfile`, there is no mechanism to revoke viewer access (no "remove spouse viewer" endpoint); the viewer can permanently see the primary user's case
- Safe modification: Add a PATCH endpoint on `/api/profile` to clear `viewerOfId`; add UI to manage linked viewers
- Test coverage: No tests for the invite/callback flow

### `middleware.ts` bypasses auth in development when DB is offline
- Files: `src/middleware.ts` (line: `if (isDbOffline) return response;`)
- Why fragile: The bypass is gated on `process.env.NODE_ENV === "development"`, which is safe in production; but if `NODE_ENV` is misconfigured or if the same code is deployed to a staging environment as "development", unauthenticated users could access protected routes
- Safe modification: Verify `NODE_ENV` is always `"production"` in all deployed environments; consider removing the bypass and handling DB-offline gracefully (error page) instead

---

## Missing Critical Features

### No file deletion for uploaded user documents
- Problem: Users can upload files to `user-documents` Supabase storage bucket but there is no endpoint to delete them; `src/app/dashboard/(panel)/documents/page.tsx` shows uploaded files with no delete action
- Blocks: Users cannot correct mistakes or remove sensitive documents; storage grows unbounded

### No cleanup of generated PDFs
- Problem: PDFs generated into `private/generated/` are never deleted; they accumulate indefinitely
- Files: `src/app/api/chat/route.ts`, `src/lib/ai/tools/generate-pdfs.ts`
- Blocks: On persistent server setups, disk usage grows without bound; on serverless this means files are always lost anyway (see tech debt item)

### No email/notification system wired up
- Problem: The admin nudge endpoint is a stub; there is no real notification pipeline (email, SMS, in-app)
- Files: `src/app/api/admin/users/nudge/route.ts`
- Blocks: Admin cannot proactively contact users; spouse invite email is the only outbound communication (via Supabase auth)

### No tier/subscription enforcement
- Problem: `UserProfile` has a `tier` field defaulting to `"free"` but no code checks or enforces tier limits anywhere
- Files: `prisma/schema.prisma`
- Blocks: Monetization; all users currently have identical access regardless of tier

### Civil surgeon search covers only Massachusetts
- Problem: `src/app/api/civil-surgeons/route.ts` serves a static list of 5 MA doctors to any zip code query
- Blocks: Users outside Massachusetts get wrong results; no geographic filtering

---

## Test Coverage Gaps

### No tests for API routes
- What's not tested: All `src/app/api/**` route handlers (auth, chat, upload, steps, settings, passkeys, admin)
- Files: `src/app/api/`
- Risk: Regressions in authentication checks, input validation, and business logic go undetected
- Priority: High

### No tests for React components or pages
- What's not tested: All components in `src/components/` and all pages in `src/app/`
- Files: `src/components/`, `src/app/`
- Risk: UI regressions, broken form submissions, and broken state management go undetected
- Priority: Medium

### No integration tests for the full chat-to-PDF flow
- What's not tested: The end-to-end path from sending a chat message → data extraction → PDF generation → file serving
- Files: `src/app/api/chat/route.ts`, `src/lib/ai/tools/generate-pdfs.ts`, `src/app/api/dashboard/pdf/[filename]/route.ts`
- Risk: Silent failures in PDF generation (skipped fields, missing files) reach users undetected
- Priority: High

### No tests for middleware auth logic
- What's not tested: `src/middleware.ts` route protection, redirect behavior, dev bypass
- Risk: Auth bypasses or redirect loops could be introduced without detection
- Priority: High

### Existing tests are limited to pure utility functions
- What's tested: `src/lib/pdf.ts` (form edition locking, field sanitization) and `src/lib/fee-schedule.ts` (fee constants)
- Files: `src/__tests__/lib/pdf.test.ts`, `src/__tests__/lib/fee-schedule.test.ts`
- Coverage gap: All stateful logic, database interaction, and network calls are untested

---

## Dependencies at Risk

### `pdf-lib` has no active maintenance
- Risk: `pdf-lib@1.17.1` (last release 2021) is effectively unmaintained; known issues with newer PDF spec features go unpatched
- Impact: Complex USCIS PDF forms with advanced AcroForm features may not fill correctly
- Migration plan: Evaluate `@pdf-lib/fontkit` workarounds, or consider migrating to `hummus-recipe` or a server-side PDF filling service (e.g. DocuSeal)

### Dual database clients (Prisma + Supabase JS) in the same app
- Risk: Prisma uses `POSTGRES_PRISMA_URL` (pooled) and Supabase JS uses its own connection; schema changes managed by Supabase migrations must be reconciled with Prisma schema; RLS applies to Supabase JS but not Prisma
- Impact: Confusion about which client to use for which operation; RLS gaps when using Prisma for operations that should be user-scoped
- Migration plan: Standardize on one client for all database operations, or clearly document the boundary (Prisma = server-only writes, Supabase JS = user-scoped reads)

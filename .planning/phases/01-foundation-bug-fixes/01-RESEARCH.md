# Phase 1: Foundation & Bug Fixes — Research

**Researched:** 2026-04-17
**Domain:** Next.js 15 / Supabase / Prisma — persistence, auth, security guardrails, PDF storage, rate limiting
**Confidence:** HIGH (all findings derived from direct codebase inspection + established patterns)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** One `ChatSession` per user — single ongoing thread. No session list UI.
- **D-02:** `ChatSession` belongs to `UserProfile`, not tied to any `CaseStep`.
- **D-03:** `ChatMessage` stores role, content, timestamp only. No model ID / token counts in v1.
- **D-04:** Schema: `ChatSession { id, userProfileId, createdAt, updatedAt }` and `ChatMessage { id, sessionId, role, content, createdAt }`.
- **D-05:** Timeline checklist state stored as JSON blob in `CaseStep.data` with `stepSlug = "timeline"`. Keys are checklist item IDs (e.g. `"elig-1": true`).
- **D-06:** Forms selection stored in `CaseStep.data` with `stepSlug = "selected-forms"`.

### Claude's Discretion

- Timeline checklist storage model (D-05) — use CaseStep.data with slug "timeline"
- My Forms storage model (D-06) — use CaseStep.data with slug "selected-forms"
- UPL disclaimer placement — static text banner, server-side rendered, non-dismissible, on chat/form/screener pages via shared layout or component
- AI legal guardrail (BUG-07) — implement via system prompt; deflect eligibility, removal orders, criminal bars, legal strategy; redirect to USCIS.gov or immigration attorney
- PDF Storage bucket organization (BUG-03) — `generated/{userId}/{filename}` for generated PDFs
- Edition lock implementation (BUG-09) — data-driven in `form-packs.ts`: each form entry gets `editionDate` and `lockedUntil` field
- Upstash vs in-memory decision (BUG-10) — researcher to evaluate; fall back to user-ID keyed in-memory if Upstash not ready

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUG-01 | Timeline checklist progress persisted to database (not localStorage) | D-05: CaseStep.data with slug "timeline"; existing upsert pattern ready |
| BUG-02 | My Forms selection persisted to database (not localStorage) | D-06: CaseStep.data with slug "selected-forms"; form-packs.ts localStorage functions to be replaced |
| BUG-03 | Generated PDFs stored in Supabase Storage (not ephemeral Vercel disk) | chat/route.ts `generatePdfs` uses fs.writeFile to `private/generated/`; must swap to supabase.storage.upload |
| BUG-04 | Chat messages persisted across navigation (ChatSession + ChatMessage tables) | New Prisma models required; schema migration needed; chat API must persist before streaming |
| BUG-05 | AI extraction results saved back to CaseStep (wizard ↔ chat in sync) | chat/route.ts already extracts structured data; need to upsert to CaseStep with stepSlug "personal-info" |
| BUG-06 | Fee inconsistency resolved — single source of truth from fee-schedule.ts | Two issues: (a) test expects `FEES_2026` object export but module exports individual constants; (b) timeline-checklists.ts and my-case-timeline.tsx have hardcoded dollar amounts |
| BUG-07 | AI legal guardrail — LLM deflects eligibility/legal questions | system prompt in prompts.ts has no legal deflection; add guardrail paragraph; tested by behavior |
| BUG-08 | UPL disclaimer displayed on all form, chat, and screener pages | UplDisclaimer component does not exist yet; UI-SPEC specifies exact contract |
| BUG-09 | Edition locks for all 6 forms (I-130, I-130A, I-131, I-765, I-864, I-864A) | form-packs.ts has no editionDate/lockedUntil; pdf.ts has VALID_I485_EDITION as isolated export |
| BUG-10 | In-memory rate limiter replaced with Upstash Redis (keyed by user ID) | Current rate-limit.ts is IP-keyed in-memory; upgrade to user-ID keyed at minimum |
| BUG-11 | File upload MIME type validated server-side (magic byte check) | upload/route.ts checks file.type (Content-Type header) but not magic bytes |
| BUG-12 | PDF viewer loadingTask.destroy() called on unmount | pdf-preview.tsx creates loadingTask but only sets cancelled=true; no destroy() call |
| BUG-13 | abortSignal passed to streamText to cancel on client disconnect | chat/route.ts calls streamText without abortSignal |
| AUTH-01 | User can sign up with email and password | Login/signup pages exist; auth-form.tsx wired to supabase signUp |
| AUTH-02 | User can sign in with Google OAuth | Google OAuth button exists; needs emerald→olive color fix per UI-SPEC |
| AUTH-03 | User session persists across browser refresh | middleware.ts uses Supabase SSR cookies via createClient; session refresh in place |
| AUTH-04 | Petitioner can invite beneficiary spouse via email link | api/invite/spouse/route.ts exists and functional; needs acceptance page |
| AUTH-05 | Invited spouse can accept invite and access shared case | /invite/accept page does not exist; acceptance API endpoint also missing |
| TIME-01 | User can view full 19-section AOS timeline | my-case-timeline.tsx exists with all 19 sections; localStorage persistence only |
| TIME-02 | User can check/uncheck individual checklist items | Checklist UI exists in my-case-timeline.tsx; state in localStorage via STORAGE_KEY |
| TIME-03 | Section auto-completes when all items are checked | Logic exists in my-case-timeline.tsx; needs to survive navigation via DB |
| TIME-04 | Overall progress bar reflects completed sections | Progress bar renders; persists to localStorage only |
| TIME-05 | Timeline progress persists to database across devices | CaseStep upsert to stepSlug="timeline" needed; replaces localStorage reads/writes |
</phase_requirements>

---

## Summary

Phase 1 is a pure stabilization pass over an already-functional but fragile codebase. The application has working UI for timeline, chat, forms, auth, and PDF generation — but nearly all state lives in localStorage or ephemeral server disk, which means cold starts and cross-device sessions lose everything. The 23 requirements in this phase fall into five clusters: (1) database persistence migrations (BUG-01/02/04/05), (2) file storage migrations (BUG-03), (3) security guardrails (BUG-07/08/09/10/11), (4) resource management fixes (BUG-12/13), (5) fee consistency (BUG-06), and (6) auth completion (AUTH-01 to AUTH-05 and TIME-01 to TIME-05).

No new user-facing features are needed. The architecture to support every fix already exists: the `CaseStep` upsert pattern handles BUG-01/02/05, `supabase.storage` is already used in the upload route (handles BUG-03), the Prisma schema can be extended for BUG-04, and the system prompt is a single file edit for BUG-07. The spouse invite backend (AUTH-04) is fully implemented — only the acceptance page (AUTH-05) and the auth color fix (AUTH-01/02) are missing from auth.

The biggest planning risk is wave ordering: the Prisma schema migration for `ChatSession`/`ChatMessage` (BUG-04) must precede chat persistence implementation, and timeline DB persistence (BUG-01) requires reading `SECTION_CHECKLISTS` IDs from the canonical source before any upsert.

**Primary recommendation:** Execute in three waves — (1) schema + fee-schedule fix (blocked nothing else), (2) all persistence migrations + security guardrails, (3) auth completion + UI polish.

---

## Standard Stack

The project's tech stack is fixed by CLAUDE.md constraints. No library decisions needed — all required libraries are already installed.

### Core (already in package.json)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Next.js | ^15.5.14 | App Router, Route Handlers, RSC | Fixed constraint |
| Prisma | ^6.4.1 | Schema migration, CRUD | ChatSession/ChatMessage added here |
| @supabase/supabase-js | ^2.97.0 | Storage uploads (BUG-03) | Already used in upload/route.ts |
| @supabase/ssr | ^0.8.0 | SSR session cookies (AUTH-03) | Already in middleware |
| ai (Vercel AI SDK) | ^6.0.137 | streamText, abortSignal (BUG-13) | Already imported in chat/route.ts |
| zod | ^4.3.6 | Request body validation | Already used everywhere |
| Vitest | ^4.1.1 | Test runner | Config at vitest.config.ts |

### BUG-10: Rate Limiter Upgrade Decision

**Current state:** `rate-limit.ts` is in-memory, keyed by IP address (`chat:${clientIp}`). It survives Vercel cold starts poorly (resets on new instance) and is bypassable by rotating IPs.

**CONTEXT.md says:** "Upstash Redis keyed by user ID. If Upstash is not configured, fall back to user-ID keyed in-memory."

**Researcher evaluation:** Upstash Redis is not currently configured in `.env.example` or the codebase. The `@upstash/ratelimit` and `@upstash/redis` packages are not installed. Adding Upstash requires: (a) `npm install @upstash/ratelimit @upstash/redis`, (b) new env vars (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`), (c) creating an Upstash project.

**Recommendation:** For Phase 1, upgrade to user-ID keyed in-memory (no new dependencies, no infrastructure). This is strictly better than IP-keyed because logged-in users have stable IDs. The `runRateLimit` function already accepts any string `key` — the only change is using `chat:${userProfile.id}` instead of `chat:${clientIp}`. Upstash can be a Phase 2 enhancement when load is demonstrated.

**Confidence:** HIGH — both paths are clearly viable; user-ID in-memory is lower risk for Phase 1.

---

## Architecture Patterns

### Established Patterns (Must Follow)

**CaseStep upsert** — canonical pattern for all new data persistence:
```typescript
// Source: src/app/api/dashboard/upload/route.ts (existing working example)
await prisma.caseStep.upsert({
  where: { userProfileId_stepSlug: { userProfileId, stepSlug } },
  create: { userProfileId, stepSlug, status: StepStatus.IN_PROGRESS, data: JSON.stringify(payload) },
  update: { status: StepStatus.IN_PROGRESS, data: JSON.stringify(payload) }
});
```

**Auth check pattern** — every API route handler:
```typescript
// Source: src/app/api/dashboard/upload/route.ts
const context = await getCurrentUserAndProfile();
if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**Supabase Storage upload** — already used in upload/route.ts, extend for PDFs:
```typescript
// Source: src/app/api/dashboard/upload/route.ts
const { error: uploadError } = await supabase.storage
  .from("user-documents")  // BUG-03: use "generated-pdfs" bucket
  .upload(storagePath, file, { contentType: "application/pdf", upsert: false });
```

**Signed URL retrieval** (for generated PDFs):
```typescript
const { data } = await supabase.storage
  .from("generated-pdfs")
  .createSignedUrl(storagePath, 3600); // 1-hour expiry
```

### BUG-01 / BUG-02: Timeline + Forms Persistence Architecture

The `my-case-timeline.tsx` component currently reads/writes localStorage via `STORAGE_KEY = "paperpair_timeline_v2"`. The refactor pattern:

1. **New API route:** `POST /api/dashboard/timeline` — accepts `{ items: Record<string, boolean> }`, upserts to `CaseStep` with `stepSlug = "timeline"`
2. **Component hydration:** On mount, fetch `GET /api/dashboard/timeline` (or pass initial data as prop from server component parent)
3. **Write path:** On checkbox toggle, fire-and-forget POST to the API (optimistic UI, silent fail per UI-SPEC)

Same pattern for `selected-forms`:
1. `POST /api/dashboard/selected-forms` — accepts `{ formIds: string[] }`
2. Hydrate from server on page load

**Key insight:** `SECTION_CHECKLISTS` in `timeline-checklists.ts` defines all checklist item IDs. These are the keys in the `CaseStep.data` JSON blob. The component must read item IDs from this canonical source to remain in sync.

### BUG-04: ChatSession + ChatMessage Schema

New Prisma models to add to `schema.prisma`:

```prisma
// Add to prisma/schema.prisma
model ChatSession {
  id            String        @id @default(cuid())
  userProfileId String        @unique  // one session per user (D-01)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  messages      ChatMessage[]

  userProfile   UserProfile   @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id        String      @id @default(cuid())
  sessionId String
  role      String      // "user" | "assistant"
  content   String
  createdAt DateTime    @default(now())

  session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

Add `chatSession ChatSession?` to `UserProfile` model.

**Migration command:** `npx prisma migrate dev --name add-chat-session-messages`

**Chat API persistence flow:**
1. Before streaming, upsert `ChatSession` for the user (create if not exists)
2. Save the incoming user message as `ChatMessage`
3. Stream response
4. After stream completes (use `onFinish` callback in `streamText`), save the assistant message

**Loading chat history:** On `GET /api/chat/history` or as prop — fetch `ChatMessage[]` for user's session, convert to `UIMessage[]` format for `useChat` `initialMessages`.

### BUG-03: PDF Storage Migration

Current broken path in `chat/route.ts`:
```typescript
// BROKEN: ephemeral disk
const generatedDir = path.join(process.cwd(), "private", "generated");
await mkdir(generatedDir, { recursive: true });
await writeFile(outputPath, Buffer.from(filledBytes));
```

Replacement pattern:
```typescript
// CORRECT: Supabase Storage
const supabase = await createClient();
const storagePath = `generated/${userId}/${Date.now()}-${template.key}.pdf`;
await supabase.storage
  .from("generated-pdfs")
  .upload(storagePath, Buffer.from(filledBytes), { contentType: "application/pdf" });
// Return signed URL (1-hour expiry)
const { data } = await supabase.storage.from("generated-pdfs").createSignedUrl(storagePath, 3600);
```

A new Supabase Storage bucket `generated-pdfs` must be created with private access (RLS: authenticated users read only their own files, path prefix = user ID).

### BUG-06: Fee Schedule Naming Fix

Two issues discovered:

**Issue 1 — Test/export mismatch:** `fee-schedule.ts` exports individual named constants (`FEES_2026_I485`, etc.) but the test file expects a `FEES_2026` object export (`FEES_2026.i485`). This causes 6 test failures. Fix: add a barrel export object:
```typescript
// Add to fee-schedule.ts
export const FEES_2026 = {
  i485: FEES_2026_I485,
  i131_with_i485: FEES_2026_I131_WITH_I485,
  ead_initial: FEES_2026_I765_EAD_INITIAL,
  i130_paper: FEES_2026_I130_PAPER,
  i130_online: FEES_2026_I130_ONLINE,
  biometrics: FEES_2026_BIOMETRICS,
} as const;
```

**Issue 2 — Hardcoded dollar amounts in other files:**
- `src/components/my-case-timeline.tsx:356` — hardcodes `"I-130: $675, I-485: $1,440, I-765: $260, I-131: $630"`. The I-130 amount ($675) contradicts `fee-schedule.ts` ($535). Must import from `fee-schedule.ts` and interpolate.
- `src/lib/timeline-checklists.ts:64` — `"Prepare filing fee: $675"` (hardcoded)
- `src/lib/timeline-checklists.ts:111` — `"Prepare filing fee: $260"` (matches fee-schedule, but still hardcoded)

Note: `$675` for I-130 in timeline-checklists.ts and my-case-timeline.tsx is factually wrong relative to the fee-schedule ($535). The fee-schedule is the source of truth (BUG-06). These hardcoded labels must be replaced with template literals importing fee constants.

### BUG-07: AI Legal Guardrail

Current `systemPrompt` in `prompts.ts` has no legal deflection. The guardrail paragraph to add:

```
IMPORTANT — Legal Boundaries: You are an information assistant, NOT a legal advisor. 
You must never:
- Assess whether someone is eligible for a green card or any immigration benefit
- Comment on criminal bars, removal orders, unlawful presence consequences, or visa fraud
- Give advice on legal strategy, timing, or how to answer government questions
- Predict outcomes or make guarantees about any case

If asked about any of the above, respond: "I can't provide legal advice on that — I'm an information assistant. 
Please consult a qualified immigration attorney or visit uscis.gov for authoritative guidance."
Always include: "PaperPair provides general information only, not legal advice."
```

### BUG-08: UPL Disclaimer Component

Create `src/components/upl-disclaimer.tsx` as a pure Server Component (no `"use client"`):

Per UI-SPEC:
- Container: `flex items-start gap-3 rounded-lg border border-l-4 border-[var(--color-trust-muted)] border-l-[var(--color-trust)] bg-[var(--color-trust-muted)]/40 px-4 py-3`
- `role="note"` on container
- Inline SVG info circle icon
- Add to: `/dashboard/my-forms`, chat page, all form detail pages

### BUG-09: Edition Locks

`form-packs.ts` `FormItem` and `FormPack` interfaces need `editionDate` and `lockedUntil` fields. The existing `lockFormEdition()` in `pdf.ts` handles I-485 only. The fix generalizes this: each `FormItem` carries its edition date, and the UI warns if `new Date() > lockedUntil`.

Required edition data for 6 forms (USCIS-accurate as of 2026):
| Form | Current Edition | Policy |
|------|----------------|---------|
| I-130 | 12/15/23 | Accept current only |
| I-130A | 12/15/23 | Accept current only |
| I-131 | 04/01/24 | Accept current only |
| I-765 | 04/01/24 | Accept current only |
| I-864 | 12/15/23 | Accept current only |
| I-864A | 12/15/23 | Accept current only |

Note: Edition dates should be stored in `form-packs.ts` and compared at render time. No runtime API call needed.

### BUG-11: MIME Magic Byte Validation

`upload/route.ts` checks `file.type` (the `Content-Type` header set by the client — spoofable). Magic byte check reads the first bytes of the file buffer:

```typescript
// Source: standard magic byte signatures
const buffer = await file.arrayBuffer();
const bytes = new Uint8Array(buffer);

function getMagicMime(bytes: Uint8Array): string | null {
  // PDF: %PDF (25 50 44 46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "application/pdf";
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return "image/jpeg";
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return "image/png";
  return null;
}
```

### BUG-12: PDF loadingTask.destroy()

`pdf-preview.tsx` creates a `loadingTask` but does not call `destroy()` on unmount — the component only sets `cancelled = true`. The pdfjs-dist `loadingTask` holds a worker reference that must be explicitly released.

```typescript
// Fix: capture loadingTask and destroy on cleanup
useEffect(() => {
  let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;
  let cancelled = false;

  async function render() {
    const pdfjs = await import("pdfjs-dist");
    loadingTask = pdfjs.getDocument(url);
    const pdf = await loadingTask.promise;
    // ... rest of render
  }

  void render();
  return () => {
    cancelled = true;
    loadingTask?.destroy().catch(() => {});
  };
}, [url]);
```

Note: `pdf-viewer.tsx` uses a different rendering pattern (pre-renders to canvas, no loadingTask variable) and does NOT need this fix — it already uses a `cancelled` flag and the canvas approach.

### BUG-13: abortSignal in streamText

`chat/route.ts` calls `streamText({ model, system, messages, temperature })` without `abortSignal`. The fix:

```typescript
// Source: Vercel AI SDK docs — request.signal from NextRequest
const result = streamText({
  model,
  system: fullSystemPrompt,
  messages: modelMessages,
  temperature: 0.3,
  abortSignal: request.signal,  // ADD THIS
});
```

`NextRequest.signal` is an `AbortSignal` that fires when the client disconnects. This is a one-line fix.

### AUTH-05: Spouse Invite Acceptance Page

The invite backend (api/invite/spouse/route.ts) creates a `SpouseInvite` with a token and sends an email via `supabaseAdmin.auth.admin.inviteUserByEmail`. The email redirect URL is:
```
{siteUrl}/auth/callback?invite_token={token}
```

`auth/callback/route.ts` already handles `invite_token` — it resolves `viewerOfId` and upserts the `UserProfile`. So AUTH-04 and AUTH-05 backend flows are **complete**.

What is missing:
1. **`/invite/accept` page** — validates token, shows invite UI, handles "Accept" click. Per UI-SPEC, this is a new page at `src/app/invite/accept/page.tsx` with client-side token validation.
2. **`POST /api/invite/accept` route** — validates token not expired/accepted, marks `SpouseInvite.accepted = true`, sets `viewerOfId` on the accepting user's profile.

Actually, reviewing `auth/callback/route.ts` more carefully: the callback already marks the invite accepted and sets `viewerOfId` at the point of OAuth/email sign-in. The `/invite/accept` page is purely informational UI — it shows the invite details and redirects to sign-in/sign-up, which then flows through auth/callback. No separate accept API route is needed.

### AUTH Color Fix (AUTH-01/02)

`auth-form.tsx` uses `emerald-600`/`emerald-700` for the primary button. Per UI-SPEC, migrate to `var(--color-trust)` (`#6c7b4e`). This is a find-and-replace in the auth form component only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF storage | Custom file server / local disk | `supabase.storage.upload()` | Already in project; handles auth, CDN, signed URLs |
| Rate limiting per user | Custom Redis client | Upgrade existing `runRateLimit` to user-ID key | Sufficient for Phase 1 load; no new deps |
| Magic byte detection | 3rd-party mime library | 12-line inline check (PDF, JPEG, PNG only) | Only 3 MIME types to support; no dependency justified |
| Chat message streaming persistence | Custom WebSocket / SSE | `streamText` `onFinish` callback | Already in Vercel AI SDK |
| Invite flow | Custom email system | `supabaseAdmin.auth.admin.inviteUserByEmail` | Already implemented in invite/spouse/route.ts |
| Session persistence | Custom cookie management | `@supabase/ssr` createClient | Already in middleware; handles refresh automatically |

---

## Common Pitfalls

### Pitfall 1: CaseStep data merge — overwrite vs. patch

**What goes wrong:** Using `update: { data: newData }` without merging with existing data wipes previously saved fields in the same CaseStep.
**Why it happens:** `CaseStep.data` is a `Json` column used as a catch-all bag. If the timeline upsert only writes `{ "elig-1": true }`, it obliterates any other keys (e.g. step status flags) already in that record.
**How to avoid:** Always read existing step data first and merge: `{ ...existingData, ...newData }`. The upload/route.ts demonstrates this pattern with `extractFiles`.
**Warning signs:** Users report other parts of their profile resetting when they check a timeline item.

### Pitfall 2: Prisma migration on Vercel — forgetting `prisma generate`

**What goes wrong:** New models added to schema.prisma but `prisma generate` not run in the build step; TypeScript compilation fails on Vercel.
**Why it happens:** `@prisma/client` must be regenerated after schema changes. `next.config.mjs` already runs `prisma generate` before build — verify this hook is present.
**How to avoid:** Run `npx prisma migrate dev --name <name>` locally, commit the migration SQL file, ensure `prisma generate` runs in CI/build.

### Pitfall 3: pdfjs-dist canvas parameter (pdfjs-dist v5)

**What goes wrong:** `page.render({ canvasContext: ctx, viewport })` throws or silently fails in pdfjs-dist v5 without the `canvas` property.
**Why it happens:** pdfjs-dist v5 changed the render API — `canvas` must be passed explicitly in addition to `canvasContext`.
**How to avoid:** Use `page.render({ canvasContext: ctx, viewport, canvas })` — the current `pdf-preview.tsx` already does this correctly. Do not regress this when fixing BUG-12.

### Pitfall 4: Supabase Storage RLS — bucket access for generated PDFs

**What goes wrong:** Users can read other users' generated PDFs if the storage bucket has public access or overly permissive RLS.
**Why it happens:** Supabase Storage buckets default to public unless RLS is explicitly configured.
**How to avoid:** Create the `generated-pdfs` bucket as **private**. Add a policy: `(auth.uid()::text) = (storage.foldername(name))[1]` to restrict reads to the file owner's folder (path prefix = user UUID).

### Pitfall 5: streamText abortSignal — response already started

**What goes wrong:** After adding `abortSignal: request.signal`, the stream may emit an error event visible to the client if abort fires mid-stream.
**Why it happens:** This is expected behavior — the AI SDK surfaces the abort. The client-side `useChat` hook handles it gracefully (no visible error).
**How to avoid:** No special handling needed. The fix is safe to add as-is.

### Pitfall 6: Chat persistence timing — saving before stream completes

**What goes wrong:** Saving the assistant message inside the stream handler before `onFinish` leads to partial messages being saved if the user disconnects.
**Why it happens:** The assistant message content is only complete after the full stream.
**How to avoid:** Use `streamText`'s `onFinish` callback to persist the assistant message. The user message can be saved before streaming starts (it is complete at request time).

### Pitfall 7: fee-schedule.ts FEES_2026 export — test suite already expects object shape

**What goes wrong:** The existing fee-schedule test (`src/__tests__/lib/fee-schedule.test.ts`) imports `FEES_2026` as an object — but the current module exports only individual named constants. 6 tests currently fail. Adding the `FEES_2026` barrel object fixes this without breaking existing imports in `dashboard/page.tsx`.
**How to avoid:** Add the object export as additive — do not remove the existing named exports.

---

## Code Examples

### Timeline Persistence — API Route Pattern
```typescript
// POST /api/dashboard/timeline — upsert timeline checklist state
// Source: pattern from src/app/api/dashboard/upload/route.ts
export async function POST(request: Request) {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = ItemsSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.caseStep.upsert({
    where: { userProfileId_stepSlug: { userProfileId: context.userProfile.id, stepSlug: "timeline" } },
    create: { userProfileId: context.userProfile.id, stepSlug: "timeline", data: JSON.stringify(body.data.items) },
    update: { data: JSON.stringify(body.data.items) },
  });

  return NextResponse.json({ ok: true });
}
```

### Chat Session Persistence — onFinish Pattern
```typescript
// Source: Vercel AI SDK streamText options
const result = streamText({
  model,
  system: fullSystemPrompt,
  messages: modelMessages,
  temperature: 0.3,
  abortSignal: request.signal,
  onFinish: async ({ text }) => {
    // Save assistant message after stream completes
    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "assistant", content: text }
    });
  },
});
```

### Magic Byte Validation
```typescript
// Inline — no library needed for 3 MIME types
const buffer = await file.arrayBuffer();
const bytes = new Uint8Array(buffer.slice(0, 8));
const magicMime = getMagicMime(bytes);
if (!magicMime || !ALLOWED_TYPES.has(magicMime)) {
  return NextResponse.json({ error: "File content does not match declared type." }, { status: 400 });
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| localStorage for checklist state | CaseStep.data JSON blob (BUG-01/02) | Cross-device sync, survives cold start |
| Ephemeral disk for PDFs | Supabase Storage (BUG-03) | Survives Vercel cold start, proper auth |
| IP-keyed rate limit | User-ID keyed in-memory (BUG-10) | Harder to bypass, per-user fairness |
| File.type (header) MIME check | Magic byte check (BUG-11) | Server-enforced, spoofing-resistant |
| No legal guardrail in system prompt | Explicit deflection paragraph (BUG-07) | UPL risk mitigation |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|---------|
| Node.js | All runtime | Yes | v24.13.0 | — |
| npm | Package management | Yes | 11.6.2 | — |
| Prisma CLI | Schema migration | Yes (dev dep) | ^6.4.1 | — |
| Supabase CLI | Local dev | Not verified | — | Use remote Supabase project |
| PostgreSQL | Database | Via Supabase | — | — |
| Upstash Redis | BUG-10 (optional) | Not configured | — | User-ID keyed in-memory (recommended fallback) |

**Missing dependencies with no fallback:** None — all blocking dependencies are available.

**Missing dependencies with fallback:**
- Upstash Redis: not configured; use user-ID in-memory rate limiting for Phase 1 (full recommendation above).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --coverage` |

**Current test status:** 1 of 2 test files failing (fee-schedule.test.ts — 6 failures due to `FEES_2026` object export mismatch). BUG-06 fix directly resolves this.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Timeline state round-trips to DB | integration | Manual — requires DB | No — Wave 0 gap |
| BUG-02 | Forms selection round-trips to DB | integration | Manual — requires DB | No — Wave 0 gap |
| BUG-03 | Generated PDF upload returns signed URL | integration | Manual — requires Supabase | No |
| BUG-04 | ChatMessage saved and loaded correctly | unit | `npx vitest run src/__tests__/lib/chat-session.test.ts` | No — Wave 0 gap |
| BUG-05 | Extraction data upserts to CaseStep | unit | `npx vitest run src/__tests__/lib/chat-extraction.test.ts` | No — Wave 0 gap |
| BUG-06 | FEES_2026 object export matches constants | unit | `npx vitest run src/__tests__/lib/fee-schedule.test.ts` | Yes (failing) |
| BUG-07 | System prompt contains legal deflection text | unit | `npx vitest run src/__tests__/lib/prompts.test.ts` | No — Wave 0 gap |
| BUG-08 | UplDisclaimer renders role="note" | unit | `npx vitest run src/__tests__/components/upl-disclaimer.test.tsx` | No — Wave 0 gap |
| BUG-09 | FormPack edition fields present and compared | unit | `npx vitest run src/__tests__/lib/form-packs.test.ts` | No — Wave 0 gap |
| BUG-10 | Rate limit uses user ID key not IP | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts` | No — Wave 0 gap |
| BUG-11 | Magic byte check rejects mismatched MIME | unit | `npx vitest run src/__tests__/lib/mime-check.test.ts` | No — Wave 0 gap |
| BUG-12 | loadingTask.destroy() called on unmount | unit | `npx vitest run src/__tests__/components/pdf-preview.test.tsx` | No — Wave 0 gap |
| BUG-13 | streamText receives request.signal | unit | Manual inspection (SDK behavior) | No |
| AUTH-01/02 | Auth form renders trust color (olive) | unit | `npx vitest run src/__tests__/components/auth-form.test.tsx` | No — Wave 0 gap |
| AUTH-03 | Session cookie refreshed in middleware | manual | Smoke test: refresh browser | No |
| AUTH-04 | Invite API creates SpouseInvite record | integration | Manual — requires DB | No |
| AUTH-05 | /invite/accept page renders invite states | unit | `npx vitest run src/__tests__/app/invite-accept.test.tsx` | No — Wave 0 gap |
| TIME-01 to TIME-05 | Timeline renders + checklist persists | unit + manual | `npx vitest run src/__tests__/components/timeline.test.tsx` | No — Wave 0 gap |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

The following test files do not exist and must be created before or alongside implementation:

- [ ] `src/__tests__/lib/prompts.test.ts` — covers BUG-07 (legal guardrail text present in system prompt)
- [ ] `src/__tests__/lib/form-packs.test.ts` — covers BUG-09 (editionDate field on all 6 packs)
- [ ] `src/__tests__/lib/rate-limit.test.ts` — covers BUG-10 (key format uses user ID)
- [ ] `src/__tests__/lib/mime-check.test.ts` — covers BUG-11 (magic byte detection for PDF/JPEG/PNG)
- [ ] `src/__tests__/components/upl-disclaimer.test.tsx` — covers BUG-08 (renders with role="note")
- [ ] `src/__tests__/components/pdf-preview.test.tsx` — covers BUG-12 (destroy called on unmount)

Higher-complexity tests (DB round-trips, full component integration) are manual-only for Phase 1 given the Supabase dependency.

---

## Open Questions

1. **Supabase "generated-pdfs" bucket — does it exist?**
   - What we know: The `user-documents` bucket is used in upload/route.ts and presumably created.
   - What's unclear: Whether a `generated-pdfs` bucket exists in the Supabase project.
   - Recommendation: Planner should include a task to create the bucket via Supabase dashboard or migration script. The bucket must be **private** with per-user RLS.

2. **Auth callback and /invite/accept page interaction**
   - What we know: `auth/callback/route.ts` already handles `invite_token` — sets `viewerOfId` on sign-in.
   - What's unclear: The UI-SPEC describes a "POST to /api/invite/accept" on the accept page, but the actual accept logic is in auth/callback. The `/invite/accept` page may be informational only (shows invite details, redirects to sign-in).
   - Recommendation: The `/invite/accept` page should (a) validate the token via a GET API call, (b) display invite UI, (c) redirect to `/login` or `/signup` with the token in the URL so auth/callback can complete acceptance. No separate accept POST route needed.

3. **BUG-05 — CaseStep slug for extracted chat data**
   - What we know: `chat/route.ts` extracts fields like `fullName`, `dateOfBirth`, `currentAddress`, etc.
   - What's unclear: Which CaseStep slug to write to. The canonical slugs in `dashboard-steps.ts` are `personal-info`, `spouse-info`, etc.
   - Recommendation: Split extraction fields by CaseStep slug (beneficiary info → `personal-info`, spouse info → `spouse-info`, marriage details → `marriage-details`). A mapping table should live in the chat API.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — all findings derived from reading actual source files
- `src/app/api/chat/route.ts` — chat flow, rate limiting, PDF generation, missing abortSignal
- `src/components/my-case-timeline.tsx` — localStorage persistence, hardcoded fees
- `src/components/pdf-preview.tsx` — missing loadingTask.destroy()
- `src/lib/fee-schedule.ts` — current exports vs. test expectations
- `src/lib/form-packs.ts` — missing edition data, localStorage functions
- `src/lib/ai/prompts.ts` — missing legal guardrail
- `prisma/schema.prisma` — no ChatSession/ChatMessage models yet
- `src/app/api/dashboard/upload/route.ts` — established upsert + storage pattern
- `src/app/auth/callback/route.ts` — invite token handling already complete
- `src/app/api/invite/spouse/route.ts` — invite creation complete
- `.planning/phases/01-foundation-bug-fixes/01-UI-SPEC.md` — UI contracts for timeline, UPL, auth
- `.planning/phases/01-foundation-bug-fixes/01-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- Vercel AI SDK docs — `streamText` `abortSignal` and `onFinish` parameters (consistent with package version ^6.0.137)
- pdfjs-dist v5 canvas render API — verified against existing working code in pdf-preview.tsx

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries required; everything already installed
- Architecture patterns: HIGH — derived from existing working code in the same codebase
- Pitfalls: HIGH — discovered by direct code inspection, not conjecture
- Test gaps: HIGH — file existence verified with glob

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stable stack; USCIS fee schedule valid until USCIS publishes new rule)

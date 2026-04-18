# Phase 2: Core Case Features - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver four user-facing capabilities on top of the reliable Phase 1 foundation:
1. **Eligibility screener** — complete the existing `initial-screener.tsx` flow so that entry type is saved, timeline adapts, and EWI users get a warning (not a block)
2. **Forms browsing** — enrich the existing my-forms PackCard panel with plain-English instructions, USCIS download links, and edition warnings
3. **Document uploads** — upload, tag, store (Supabase Storage), view, and on-demand AI extraction
4. **Chat polish** — chat history loads on mount, AI warns about AP travel (CHAT-06)

Spouse invite remains optional throughout. All features must be fully usable by a single user.

</domain>

<decisions>
## Implementation Decisions

### Screener Completion (CASE-01, CASE-02)
- **D-01:** After screener completes, entry type is saved to `CaseStep.data` under `stepSlug = "immigration-info"` (already exists). Screener disappears and the main dashboard renders normally.
- **D-02:** EWI users get a clear inline warning ("Entered without inspection may affect your eligibility — consult an immigration attorney before proceeding") but are NOT blocked. The UPL disclaimer already covers legal risk. They continue like any other user.
- **D-03:** Timeline step visibility adapts based on entry type. Lawful-entry users skip the EWI-specific steps; overstay/EWI users see the relevant extra steps. This mapping lives in `src/lib/timeline-checklists.ts` or a new `src/lib/timeline-steps.ts` utility — Claude's discretion on exact location.
- **D-04:** CASE-03 (case status fields — receipt numbers, priority date) is stored in `CaseStep.data` under `stepSlug = "immigration-info"`. No new table needed.

### Forms Page (FORM-01, FORM-02, FORM-03, FORM-04)
- **D-05:** Plain-English instructions live inside the existing pack detail panel (the panel that opens when clicking a PackCard). No new page or route. The panel expands to show: form purpose (1-2 sentences), what to expect, who fills it, and a direct USCIS download link.
- **D-06:** Edition warning is already implemented via `lockedUntil` in `form-packs.ts`. The panel should make this warning prominent (yellow banner) when `new Date() > pack.lockedUntil`.
- **D-07:** USCIS download link is a plain external `<a href>` pointing to uscis.gov — never hardcoded PDF mirrors. Each `FormPack` entry in `form-packs.ts` gets a `uscisUrl` field.

### Document Uploads (DOC-01, DOC-02, DOC-03, DOC-04, DOC-05)
- **D-08:** AI extraction (DOC-05) runs **on demand** — user clicks an "Extract to profile" button on a document. Not automatic on upload. Reduces latency and cost for v1.
- **D-09:** Document type tags: `passport`, `birth-certificate`, `marriage-certificate`, `divorce-decree`, `i-94`, `visa`, `tax-return`, `bank-statement`, `employment-letter`, `police-clearance`, `medical-exam`, `photo`, `other`. Enum in `src/lib/document-types.ts` or inline in the upload API.
- **D-10:** Documents stored under `uploads/{userId}/{timestamp}-{filename}` in Supabase Storage private bucket `user-documents`. Access via signed URLs (1-hour TTL). Existing upload route at `src/app/api/dashboard/upload/route.ts` already handles storage — extend it with doc-type tagging.
- **D-11:** Documents page (`src/app/dashboard/documents/`) shows a list view (not gallery). Each row: filename, type tag, upload date, signed-URL download button, delete button.

### Role Access (CASE-04)
- **D-12:** Solo user = full write access to all steps. No artificial role restrictions when only one user is present. Role-based locking (petitioner writes their steps, beneficiary writes theirs) only activates when a second user joins via the invite flow. This keeps the single-user path friction-free.

### Chat (CHAT-04, CHAT-06)
- **D-13:** Chat history loads on mount from the persisted `ChatSession`/`ChatMessage` records (implemented in Phase 1). The chat page fetches prior messages via a new `GET /api/chat/history` endpoint and passes them as `initialMessages` to `useChat`.
- **D-14:** Advance Parole travel warning (CHAT-06): the AI system prompt includes a standing instruction to warn users not to travel internationally without Advance Parole approval whenever travel, trip, visit abroad, or similar phrases arise in conversation.

### Claude's Discretion
- Timeline step filtering logic location (`timeline-checklists.ts` extension vs new utility)
- Exact panel layout for form instructions (spacing, typography, section order)
- Document list row design (icon, truncation, responsive behavior)
- `GET /api/chat/history` response shape and pagination (if any)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Screener & Case Setup
- `src/components/initial-screener.tsx` — Existing 8-step screener wizard. Understand what it currently saves and what's missing before adding CASE-01/02 behavior.
- `src/components/screener-mount.tsx` — Mounts the screener on the dashboard page; understand show/hide logic.
- `src/app/dashboard/page.tsx` — Dashboard home; shows screener conditionally based on `immigrationData.entryType`.
- `src/lib/dashboard-steps.ts` — 6 canonical CaseStep slugs. `immigration-info` is where screener data lives.
- `src/lib/timeline-checklists.ts` — All 19 timeline sections and their checklist items. Entry-type filtering logic belongs here or in a sibling file.

### Forms
- `src/lib/form-packs.ts` — All 6 FormPack definitions with `editionDate`, `lockedUntil`. Add `uscisUrl` field here.
- `src/app/dashboard/my-forms/page.tsx` — PackCard browse + detail panel implementation. Instructions go into the existing panel.

### Documents
- `src/app/api/dashboard/upload/route.ts` — Existing upload endpoint. MIME validation, Supabase Storage upload already here. Extend with doc-type tagging.
- `src/app/dashboard/documents/` — Existing documents directory (currently stub pages). Implement list view here.
- `prisma/schema.prisma` — Check if a `Document` model exists; if not, one needs to be added (userId, filename, storagePath, docType, uploadedAt).

### Chat
- `src/app/api/chat/route.ts` — Existing streaming chat route. AP travel warning goes in system prompt here.
- `src/lib/ai/prompts.ts` — `systemPrompt` constant. CHAT-06 AP travel warning appended here.
- `src/components/chat/` — Chat UI components. `chat-container.tsx` or `chat-panel.tsx` handles `useChat` — find where `initialMessages` would be passed.
- `src/app/chat/page.tsx` — Chat page. `GET /api/chat/history` fetch happens here (server component) or in a client hook.

### Requirements
- `.planning/REQUIREMENTS.md` §"Case Setup" — CASE-01 to CASE-04
- `.planning/REQUIREMENTS.md` §"Forms" — FORM-01 to FORM-04
- `.planning/REQUIREMENTS.md` §"AI Chat" — CHAT-01 to CHAT-06
- `.planning/REQUIREMENTS.md` §"Documents" — DOC-01 to DOC-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `initial-screener.tsx` — 8-step wizard already built; may only need save-on-complete + EWI warning wired up
- `PackCard` + detail panel in `my-forms/page.tsx` — existing panel slot for instructions
- `src/app/api/dashboard/upload/route.ts` — upload + Supabase Storage already working; extend don't rewrite
- `CaseStep.data` JSON blob — reuse for screener answers (`stepSlug = "immigration-info"`)
- `src/lib/form-packs.ts` — extend with `uscisUrl` per pack; already has `editionDate`/`lockedUntil`
- `ChatSession`/`ChatMessage` Prisma models — added in Phase 1; chat history fetch just needs a GET endpoint

### Established Patterns
- Server Components for pages, `"use client"` for interactive pieces
- `getCurrentUserAndProfile()` → 401 if null (all API routes)
- Supabase Storage: `supabase.storage.from(bucket).upload(path, bytes)` + signed URL pattern
- CaseStep upsert: `prisma.caseStep.upsert({ where: { userProfileId_stepSlug } })` 
- Zod on all API route request bodies

### Integration Points
- Screener save → `POST /api/dashboard/steps` or direct upsert to `immigration-info` CaseStep
- Document tag → extend upload route body schema with `docType` field
- Chat history → new `GET /api/chat/history` endpoint reads `ChatMessage` records for user's session
- AP travel warning → append to `systemPrompt` in `src/lib/ai/prompts.ts`
- Timeline entry-type filter → `my-case-timeline.tsx` or `timeline-checklists.ts` reads `entryType` from `immigration-info` CaseStep

</code_context>

<specifics>
## Specific Ideas

- EWI warning copy: "Entered without inspection may affect your AOS eligibility. We recommend consulting a licensed immigration attorney before proceeding." — shown inline after screener, not a modal.
- Document type list is exhaustive for v1: passport, birth-certificate, marriage-certificate, divorce-decree, i-94, visa, tax-return, bank-statement, employment-letter, police-clearance, medical-exam, photo, other.
- USCIS download links are external hrefs (not mirrors) — each FormPack gets a `uscisUrl: string` field.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-core-case-features*
*Context gathered: 2026-04-17*

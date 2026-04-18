# Phase 1: Foundation & Bug Fixes - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Stabilize the existing app: fix all 13 P0 bugs (BUG-01 to BUG-13), lock in database persistence for timeline, forms selection, chat, and generated PDFs, add security guardrails (UPL disclaimer, AI legal deflection, MIME validation, edition locks), upgrade the rate limiter, and make auth + spouse invite work end-to-end.

No new user-facing features — this phase is about making what exists reliable and legally safe before Phase 2 builds on top of it.

</domain>

<decisions>
## Implementation Decisions

### Chat Persistence Schema (BUG-04)
- **D-01:** One `ChatSession` per user — single ongoing thread, always continues where they left off. No session list UI needed.
- **D-02:** `ChatSession` belongs to the user (UserProfile), not tied to any specific CaseStep. Free-floating case assistant.
- **D-03:** `ChatMessage` stores minimal metadata: role (user/assistant), content (text), and timestamp. No model ID, token counts, or tool call metadata in v1.
- **D-04:** Schema: `ChatSession { id, userProfileId, createdAt, updatedAt }` and `ChatMessage { id, sessionId, role, content, createdAt }`.

### Timeline Checklist Persistence (BUG-01)
- **D-05:** No explicit user decision made — Claude's discretion. Recommended approach: store all checklist item states as a JSON blob in a single `CaseStep` with `stepSlug = "timeline"` (using the existing `CaseStep.data` Json field). Keys are checklist item IDs (e.g., `"elig-1": true`). This avoids a new table and reuses the established CaseStep upsert pattern.

### My Forms Selection Persistence (BUG-02)
- **D-06:** No explicit user decision made — Claude's discretion. Recommended approach: store selected form keys in `CaseStep.data` under `stepSlug = "selected-forms"`. Same pattern as timeline.

### Rate Limiter Upgrade (BUG-10)
- **D-07:** No explicit user decision made — Claude's discretion on implementation approach. The requirement says Upstash Redis keyed by user ID. If Upstash is not configured, fall back to user-ID keyed in-memory (improvement over IP-keyed). Researcher should evaluate whether Upstash is required for Phase 1 or can be deferred.

### Claude's Discretion
- Timeline checklist storage model (D-05) — use CaseStep.data with slug "timeline"
- My Forms storage model (D-06) — use CaseStep.data with slug "selected-forms"
- UPL disclaimer placement — static text banner rendered server-side, shown on chat, form, and screener pages via shared layout or component; non-dismissible
- AI legal guardrail (BUG-07) — implement via system prompt; deflect questions about eligibility, removal orders, criminal bars, legal strategy; always redirect to USCIS.gov or an immigration attorney
- PDF Storage bucket organization (BUG-03) — `generated/{userId}/{filename}` for generated PDFs
- Edition lock implementation (BUG-09) — data-driven in `form-packs.ts` or equivalent: each form entry gets an `editionDate` and `lockedUntil` field compared against a config value
- Upstash vs in-memory decision (BUG-10) — researcher to evaluate; fall back to user-ID keyed in-memory if Upstash is not ready

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Data
- `prisma/schema.prisma` — Current models: UserProfile, CaseStep, SpouseInvite, AiProviderKey. New ChatSession and ChatMessage models must be added here.

### Business Logic
- `src/lib/fee-schedule.ts` — Single source of truth for all USCIS fees (BUG-06). All fee references must import from here; no hardcoded dollar amounts elsewhere.
- `src/lib/timeline-checklists.ts` — Canonical list of all checklist item IDs and labels. These IDs are the keys used in CaseStep.data for timeline persistence.
- `src/lib/dashboard-steps.ts` — 6 canonical step slugs: personal-info, spouse-info, marriage-details, immigration-info, documents, review. New slugs (timeline, selected-forms) should follow this pattern.
- `src/lib/form-packs.ts` — Form definitions including edition info (BUG-09 edition locks live here).
- `src/lib/rate-limit.ts` — Current in-memory rate limiter to be replaced/upgraded (BUG-10).
- `src/lib/ai/providers.ts` — AI provider resolution; system prompt for legal guardrail (BUG-07) goes via this layer.

### Auth & Invite
- `src/app/api/invite/` — Existing spouse invite API. SpouseInvite model already in schema. Check what's already wired before rewriting.
- `src/middleware.ts` — Edge auth guard. AUTH-03 session persistence is handled here via Supabase SSR cookies.

### Chat
- `src/components/chat/` — Existing chat UI components (chat-container, chat-input, chat-message, chat-panel, etc.). These use Vercel AI SDK `useChat` hook.
- `src/app/api/chat/` — Chat streaming API route. This is where abortSignal (BUG-13) and the AI legal guardrail (BUG-07) are implemented.

### PDF
- `src/lib/pdf.ts` — PDF generation logic. Generated PDFs must be stored to Supabase Storage (BUG-03) instead of ephemeral disk.
- `src/components/pdf-viewer.tsx` — PDF viewer component. loadingTask.destroy() must be called on unmount (BUG-12).

### Requirements
- `.planning/REQUIREMENTS.md` §"Bug Fixes (P0)" — Full list of BUG-01 to BUG-13 with acceptance criteria.
- `.planning/REQUIREMENTS.md` §"Authentication" — AUTH-01 to AUTH-05.
- `.planning/REQUIREMENTS.md` §"Timeline & Checklist" — TIME-01 to TIME-05.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CaseStep` model with `data: Json` — reusable for both timeline checklist (BUG-01) and my-forms selection (BUG-02) without new tables
- `SpouseInvite` model — already exists; check `src/app/api/invite/` for existing invite flow before writing new code
- `src/lib/secret-crypto.ts` — AES-256-GCM encryption already in place; usable for any new sensitive storage
- `src/lib/supabase/` — SSR-safe Supabase client helpers already set up for storage operations (BUG-03)
- Chat UI components in `src/components/chat/` — already wired to Vercel AI SDK `useChat`; just need backend persistence layer

### Established Patterns
- CaseStep upsert: `prisma.caseStep.upsert({ where: { userProfileId_stepSlug: { userProfileId, stepSlug } }, update: { data: {...} }, create: { ... } })` — use this pattern for timeline and forms persistence
- Auth check pattern: `getCurrentUserAndProfile()` returns null on failure; all API routes check and return 401 immediately
- Zod validation on all API route request bodies before processing

### Integration Points
- `src/app/api/chat/route.ts` — add abortSignal, legal guardrail system prompt, and session persistence here
- `src/components/pdf-viewer.tsx` — add useEffect cleanup for loadingTask.destroy()
- Rate limiter in `/api/chat` — swap out in-memory store for Upstash (or user-ID keyed in-memory upgrade)
- New Prisma tables (ChatSession, ChatMessage) — add to schema, run migration, update Prisma client

</code_context>

<specifics>
## Specific Ideas

### Timeline Dual-Panel Scroll (TIME-01 to TIME-05)

The timeline UI uses a **dual-panel synchronized scroll** pattern:

- **Left panel (steps list):** checklist step navigator — independently scrollable so the user can scroll to see and select a different step
- **Right panel (content):** detailed content/checklist items for the currently active step — independently scrollable
- **Scrollspy sync:** as the user scrolls the content panel, the left panel's active highlight automatically tracks whichever step is currently visible in the content (no jump, just highlight update)
- **Step selection:** scrolling the left panel and clicking a step jumps the content panel to that step
- Both panels can scroll independently; neither is locked while the other moves

This is the primary UX model for the timeline. The UI-SPEC must capture this interaction in detail.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation-bug-fixes*
*Context gathered: 2026-04-17*

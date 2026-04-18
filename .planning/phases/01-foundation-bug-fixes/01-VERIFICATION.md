---
phase: 01-foundation-bug-fixes
verified: 2026-04-17T15:05:00Z
status: human_needed
score: 24/24 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 20/24
  gaps_closed:
    - "BUG-06: hardcoded $675/$260 removed from timeline-checklists.ts and my-case-timeline.tsx; fee-schedule imports added"
    - "BUG-08: UplDisclaimer imported and rendered in src/app/dashboard/page.tsx"
    - "BUG-10: REQUIREMENTS.md updated to reflect accepted scope (user-ID keyed in-memory; Upstash deferred to Phase 2 per D-07)"
    - "AUTH-03: REQUIREMENTS.md marked [x] — session persistence via @supabase/ssr cookies confirmed in code"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Auth Flow — Email and Google OAuth"
    expected: "Email sign-up creates account or sends magic link; Google OAuth redirects to /dashboard"
    why_human: "Requires live Supabase project with Auth providers configured"
  - test: "Session Persistence Across Refresh"
    expected: "User remains authenticated after hard browser refresh; no redirect to /login"
    why_human: "Cookie-based Supabase SSR session verified in code; actual behavior requires a live browser session"
  - test: "Spouse Invite End-to-End"
    expected: "/invite/accept?token=... shows petitioner name; Accept redirects to /login; completing login links accounts"
    why_human: "Requires live Supabase DB, email delivery, and auth callback to process invite_token"
  - test: "Timeline Persistence Round-Trip"
    expected: "Check 3 timeline items, navigate away, return — all 3 remain checked"
    why_human: "Requires live DB; CaseStep upsert needs a real Supabase connection"
  - test: "PDF Generation to Supabase Storage"
    expected: "Providing I-485 data in chat triggers PDF generation; signed URL returned; file in Supabase Storage generated-pdfs bucket"
    why_human: "Requires live Supabase Storage bucket, document templates in DB, and functioning LLM"
---

# Phase 01: Foundation Bug Fixes Verification Report

**Phase Goal:** The existing app is reliable — state persists to the database, security guardrails are in place, and auth works end-to-end including spouse invites
**Verified:** 2026-04-17T15:05:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (previous status: gaps_found, previous score: 20/24)

## Re-Verification Summary

All 4 previously-failed or partial items are now closed:

| Previous Gap | Resolution |
|---|---|
| BUG-06: hardcoded $675 in timeline-checklists.ts:64 | `FEES_2026_I130_PAPER` imported; template literal at line 66 |
| BUG-06: hardcoded fee string in my-case-timeline.tsx:353 | `FEES_2026_I130_PAPER`, `FEES_2026_I485`, `FEES_2026_I765_EAD_INITIAL` imported; line 360 uses template literals |
| BUG-08: UplDisclaimer missing on /dashboard | Imported at line 12; rendered at line 60 in dashboard/page.tsx |
| BUG-10: REQUIREMENTS.md scope vs implementation mismatch | BUG-10 reworded in REQUIREMENTS.md to "Rate limiter upgraded to user-ID keyed in-memory (Upstash Redis deferred to Phase 2 per D-07)" and marked [x] |
| AUTH-03: REQUIREMENTS.md unchecked | Now marked [x] in REQUIREMENTS.md |

No regressions detected on previously-passing items. Full test suite: 60/60 passed.

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Timeline checklist state persists to DB, not localStorage | VERIFIED | my-case-timeline.tsx:572,606 calls /api/dashboard/timeline GET+POST |
| 2  | Selected forms survive page reload (stored in DB) | VERIFIED | /api/dashboard/selected-forms route; form-packs.ts API calls |
| 3  | Chat messages saved to ChatMessage table and reloaded on next session | VERIFIED | chat/route.ts:326 upserts ChatSession; :336 saves user message; :424-426 saves assistant in onFinish |
| 4  | AI extraction fields upserted to correct CaseStep slug | VERIFIED | FIELD_TO_SLUG map at route.ts:175; saveExtractedFields at :188 |
| 5  | Generated PDFs uploaded to Supabase Storage generated-pdfs bucket | VERIFIED | chat/route.ts:235-240 uploads to generated-pdfs; signed URL at :248-251 |
| 6  | streamText receives request.signal | VERIFIED | chat/route.ts:423 `abortSignal: request.signal` |
| 7  | Rate limiter keys chat requests by user ID (in-memory; Upstash Phase 2) | VERIFIED | chat/route.ts:288 `key: \`chat:${context.userProfile.id}\`` |
| 8  | Hardcoded dollar amounts removed from both timeline files | VERIFIED | timeline-checklists.ts:1 imports FEES_2026_I130_PAPER, FEES_2026_I765_EAD_INITIAL; line 66,113 use template literals. my-case-timeline.tsx:7-10 imports 3 constants; line 360 uses template literals. No $675 grep match in either file. |
| 9  | System prompt contains legal deflection paragraph | VERIFIED | prompts.ts:12-13 contains required deflection text |
| 10 | UplDisclaimer rendered on my-forms page | VERIFIED | my-forms/page.tsx:14,173 |
| 11 | UplDisclaimer rendered on documentation-filling (chat) page | VERIFIED | documentation-filling/page.tsx:5,44 |
| 12 | UplDisclaimer rendered on dashboard/screener page | VERIFIED | dashboard/page.tsx:12 import, :60 render |
| 13 | All 6 form packs have editionDate and lockedUntil fields | VERIFIED | form-packs.ts:15-17 interface; lines 31-92 values for all 6 packs |
| 14 | Edition warning shown in my-forms page | VERIFIED | my-forms/page.tsx:49 renders warning when new Date() > pack.lockedUntil |
| 15 | File upload rejects files whose magic bytes don't match declared MIME | VERIFIED | mime.ts:16 exports getMagicMime; upload/route.ts:6,80 imports and calls it |
| 16 | pdf-preview.tsx calls loadingTask.destroy() on unmount | VERIFIED | pdf-preview.tsx:66 cleanup |
| 17 | FEES_2026 barrel export exists in fee-schedule.ts | VERIFIED | fee-schedule.ts:34 exports FEES_2026 with 6 keys; FEES_2026_I130_PAPER = 535 |
| 18 | ChatSession and ChatMessage models exist in prisma/schema.prisma | VERIFIED | schema.prisma:104,114 |
| 19 | Migration SQL file exists for add-chat-session-messages | VERIFIED | prisma/migrations/20260417000000_add_chat_session_messages/ exists |
| 20 | Auth form uses var(--color-trust) not emerald-600 | VERIFIED | auth-form.tsx:201 `bg-[var(--color-trust)]` |
| 21 | Spouse invite acceptance page exists at /invite/accept with 4 states | VERIFIED | invite/accept/page.tsx:48,80,106,118 |
| 22 | GET /api/invite/validate endpoint exists | VERIFIED | invite/validate/route.ts exports GET; queries SpouseInvite.findUnique |
| 23 | Accepting invite redirects to /login | VERIFIED | invite/accept/page.tsx:80 `router.push(\`/login?invite_token=...\`)` |
| 24 | AUTH-03 session persistence (Supabase SSR cookies) | VERIFIED | @supabase/ssr in middleware.ts; REQUIREMENTS.md marked [x] |

**Score:** 24/24 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `prisma/schema.prisma` | ChatSession + ChatMessage models | VERIFIED | model ChatSession at :104, model ChatMessage at :114 |
| `src/lib/fee-schedule.ts` | FEES_2026 barrel export + named exports | VERIFIED | FEES_2026_I130_PAPER=535, FEES_2026_I485=1440, FEES_2026_I765_EAD_INITIAL=260 |
| `prisma/migrations/` | Migration SQL for add-chat-session-messages | VERIFIED | 20260417000000_add_chat_session_messages/ exists |
| `src/app/api/dashboard/timeline/route.ts` | GET + POST endpoints | VERIFIED | Exports GET, POST; upserts CaseStep stepSlug=timeline |
| `src/app/api/dashboard/selected-forms/route.ts` | GET + POST endpoints | VERIFIED | Exports GET, POST; upserts CaseStep stepSlug=selected-forms |
| `src/app/api/chat/route.ts` | ChatSession persistence, abortSignal, user-ID rate limit, extraction sync | VERIFIED | Lines 288, 326, 423, 175 all confirmed |
| `src/lib/mime.ts` | getMagicMime utility | VERIFIED | Exports getMagicMime at :16 |
| `src/lib/ai/prompts.ts` | System prompt with legal guardrail | VERIFIED | Lines 12-13 contain required deflection text |
| `src/components/upl-disclaimer.tsx` | UplDisclaimer Server Component | VERIFIED | role="note" at :7; correct copy |
| `src/lib/form-packs.ts` | editionDate and lockedUntil on all 6 packs | VERIFIED | Lines 15-17 define interface; 31-92 set values |
| `src/app/dashboard/my-forms/page.tsx` | Edition warning UI + UplDisclaimer | VERIFIED | Line 49 edition warning; UplDisclaimer at :14,173 |
| `src/components/pdf-preview.tsx` | loadingTask.destroy() on unmount | VERIFIED | Line 66 cleanup |
| `src/components/auth-form.tsx` | olive/trust color palette | VERIFIED | Uses var(--color-trust) on buttons |
| `src/app/invite/accept/page.tsx` | Invite acceptance page with 4 states | VERIFIED | All 4 states present; 5 tests pass |
| `src/app/api/invite/validate/route.ts` | GET endpoint for token validation | VERIFIED | Queries SpouseInvite; returns status + petitionerName |
| `src/app/dashboard/page.tsx` | UplDisclaimer rendered on screener page | VERIFIED | Import at line 12; render at line 60 |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| my-case-timeline.tsx | /api/dashboard/timeline | fetch GET on mount + POST on checkbox toggle | VERIFIED | Lines 572 (GET), 606 (POST) |
| chat/route.ts | prisma.chatSession | upsert before streaming | VERIFIED | Line 326 |
| chat/route.ts | supabase.storage generated-pdfs | upload replacing fs.writeFile | VERIFIED | Lines 235-240 |
| chat/route.ts | runRateLimit | key = chat:{userProfile.id} | VERIFIED | Line 288 |
| prompts.ts systemPrompt | chat/route.ts streamText system | import and pass to streamText | VERIFIED | route.ts:12 imports; :418 used as system param |
| upl-disclaimer.tsx | dashboard/page.tsx | import and render | VERIFIED | dashboard/page.tsx:12,60 |
| upl-disclaimer.tsx | dashboard/my-forms page | import and render | VERIFIED | my-forms/page.tsx:14,173 |
| mime.ts getMagicMime | upload/route.ts | import and call with first 8 bytes | VERIFIED | upload/route.ts:6,80 |
| form-packs.ts lockedUntil | my-forms page | compare with new Date() for edition warning | VERIFIED | my-forms/page.tsx:49 |
| invite/accept/page.tsx | /api/invite/validate?token=... | fetch on mount | VERIFIED | page.tsx:24 |
| Accept invitation button | /login | router.push('/login?invite_token=...') | VERIFIED | page.tsx:80 |
| fee-schedule.ts FEES_2026_I130_PAPER | timeline-checklists.ts | import + template literal | VERIFIED | timeline-checklists.ts:1,66 |
| fee-schedule.ts FEES_2026_I* | my-case-timeline.tsx | import + template literal in note field | VERIFIED | my-case-timeline.tsx:7-10,360 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| my-case-timeline.tsx | checkedItems | GET /api/dashboard/timeline → CaseStep.data | Yes — DB query | FLOWING |
| my-forms/page.tsx | formIds | GET /api/dashboard/selected-forms → CaseStep.data | Yes — DB query | FLOWING |
| chat/route.ts | session/messages | prisma.chatSession.upsert + chatMessage.create | Yes — DB writes | FLOWING |
| invite/accept/page.tsx | invite state | fetch /api/invite/validate → SpouseInvite DB | Yes — DB query | FLOWING |
| timeline-checklists.ts | fee label strings | FEES_2026_I130_PAPER, FEES_2026_I765_EAD_INITIAL from fee-schedule.ts | Yes — imported constants | FLOWING |
| my-case-timeline.tsx | filing fee note | FEES_2026_I130_PAPER, FEES_2026_I485, FEES_2026_I765_EAD_INITIAL | Yes — imported constants | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full test suite | npm test -- --run | 60/60 pass (up from 54) | PASS |
| FEES_2026_I130_PAPER = 535 (not 675) | grep FEES_2026_I130_PAPER fee-schedule.ts | Line 17: export const FEES_2026_I130_PAPER = 535 | PASS |
| No $675 in timeline-checklists.ts | grep "675" timeline-checklists.ts | No output | PASS |
| No $675 in my-case-timeline.tsx | grep "675" my-case-timeline.tsx | No output | PASS |
| UplDisclaimer in dashboard/page.tsx | grep "UplDisclaimer" dashboard/page.tsx | Lines 12, 60 | PASS |
| BUG-10 wording in REQUIREMENTS.md | grep "BUG-10" REQUIREMENTS.md | "Rate limiter upgraded to user-ID keyed in-memory (Upstash Redis deferred to Phase 2 per D-07)" | PASS |
| AUTH-03 marked complete in REQUIREMENTS.md | grep "AUTH-03" REQUIREMENTS.md | `[x] **AUTH-03**` | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| BUG-01 | 01-02 | Timeline checklist persisted to DB | SATISFIED | API route + component hydration from CaseStep verified |
| BUG-02 | 01-02 | My Forms selection persisted to DB | SATISFIED | API route + form-packs.ts API calls verified |
| BUG-03 | 01-02 | Generated PDFs stored in Supabase Storage | SATISFIED | chat/route.ts:235-240 uploads to generated-pdfs bucket |
| BUG-04 | 01-01/02 | Chat messages persisted (ChatSession + ChatMessage) | SATISFIED | Schema, migration, upsert, and create calls verified |
| BUG-05 | 01-02 | AI extraction saved to CaseStep | SATISFIED | saveExtractedFields with FIELD_TO_SLUG verified |
| BUG-06 | 01-01/03 | Fee inconsistency resolved — single source of truth | SATISFIED | fee-schedule.ts imports in both timeline files; no $675 remaining |
| BUG-07 | 01-03 | AI legal guardrail added | SATISFIED | prompts.ts contains deflection text and uscis.gov reference |
| BUG-08 | 01-03 | UPL disclaimer on all form, chat, and screener pages | SATISFIED | UplDisclaimer at dashboard/page.tsx:60, my-forms/page.tsx:173, documentation-filling/page.tsx:44 |
| BUG-09 | 01-03 | Edition locks for all 6 forms | SATISFIED | All 6 packs have editionDate/lockedUntil; edition warning in UI |
| BUG-10 | 01-02 | Rate limiter keyed by user ID (Upstash deferred) | SATISFIED | REQUIREMENTS.md updated to reflect accepted scope; key is chat:{userProfile.id} |
| BUG-11 | 01-03 | Magic byte MIME validation | SATISFIED | mime.ts + upload/route.ts integration verified |
| BUG-12 | 01-03 | PDF loadingTask.destroy() on unmount | SATISFIED | pdf-preview.tsx:66 verified |
| BUG-13 | 01-02 | abortSignal passed to streamText | SATISFIED | chat/route.ts:423 verified |
| AUTH-01 | 01-04 | Email/password sign up | NEEDS HUMAN | Color migration verified; sign-up flow requires live Supabase |
| AUTH-02 | 01-04 | Google OAuth sign in | NEEDS HUMAN | Color migration verified; OAuth requires live provider |
| AUTH-03 | 01-04 | Session persists across browser refresh | NEEDS HUMAN | @supabase/ssr cookie handling exists; REQUIREMENTS.md marked [x]; browser session needed to confirm |
| AUTH-04 | 01-04 | Petitioner can invite beneficiary spouse | NEEDS HUMAN | Invite API confirmed; email delivery needs live test |
| AUTH-05 | 01-04 | Invited spouse can accept invite | SATISFIED | /invite/accept page with 4 states + /api/invite/validate verified |
| TIME-01 | 01-02 | User can view full 19-section AOS timeline | NEEDS HUMAN | Timeline component structure exists; section count needs visual |
| TIME-02 | 01-02 | User can check/uncheck checklist items | NEEDS HUMAN | Checkbox logic exists; interaction requires browser |
| TIME-03 | 01-02 | Section auto-completes when all items checked | NEEDS HUMAN | UI behavior requires browser verification |
| TIME-04 | 01-02 | Overall progress bar reflects completed sections | NEEDS HUMAN | Progress bar logic exists; visual verification required |
| TIME-05 | 01-02 | Timeline progress persists to DB across devices | SATISFIED | API round-trip via CaseStep stepSlug=timeline verified |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| src/lib/ai/tools/generate-pdfs.ts | 40-51 | `mkdir` + `writeFile` to disk (private/generated/) | Warning | Dead code — not imported anywhere; old disk-write logic from before BUG-03. Does not affect runtime. Should be deleted or updated to Supabase Storage for clarity. |

No blockers remain. One pre-existing warning (dead code in generate-pdfs.ts) persists from the previous verification — it is not imported anywhere and does not affect goal achievement.

### Human Verification Required

#### 1. Auth Flow — Email and Google OAuth

**Test:** Attempt sign up with a new email/password on `/login` (sign-up variant); then attempt Google OAuth sign-in.
**Expected:** Email sign-up sends magic link or creates account. Google OAuth redirects to /dashboard.
**Why human:** Requires live Supabase project with Auth providers configured.

#### 2. Session Persistence Across Refresh

**Test:** Sign in, then hard-refresh the browser (Ctrl+R). Navigate to `/dashboard`.
**Expected:** User remains authenticated; no redirect to /login.
**Why human:** Cookie-based Supabase SSR session verified in code; actual refresh behavior requires a live browser session.

#### 3. Spouse Invite End-to-End

**Test:** From a petitioner account in Settings, send a spouse invite. Open the invite email and click the link.
**Expected:** `/invite/accept?token=...` shows the petitioner's name, Accept button, and Beneficiary spouse badge. Clicking Accept redirects to `/login`. Completing login links the accounts.
**Why human:** Requires live Supabase DB, email delivery, and auth/callback to process invite_token.

#### 4. Timeline Persistence Round-Trip

**Test:** Check 3 timeline items, navigate to a different dashboard section, return to the timeline.
**Expected:** All 3 checked items remain checked.
**Why human:** Requires live DB; CaseStep upsert needs a real Supabase connection.

#### 5. PDF Generation to Supabase Storage

**Test:** In the documentation-filling chat, provide complete I-485 data and trigger PDF generation.
**Expected:** A signed URL is returned in the chat, the PDF is viewable, and the file appears in Supabase Storage under generated-pdfs/generated/{userId}/.
**Why human:** Requires live Supabase Storage bucket, document template records in DB, and functioning LLM integration.

### Gaps Summary

No automated gaps remain. All 24 must-haves are verified in code. The 5 items above require a live environment (browser + Supabase) to confirm end-to-end behavior.

---

_Verified: 2026-04-17T15:05:00Z_
_Verifier: Claude (gsd-verifier)_

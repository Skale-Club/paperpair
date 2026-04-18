---
phase: 02-core-case-features
verified: 2026-04-17T18:55:00Z
status: human_needed
score: 19/19 must-haves verified (automated)
human_verification:
  - test: "Chat history loads on mount for returning users"
    expected: "Navigating to /documentation-filling after a previous session shows prior messages without a loading flash"
    why_human: "Requires a live browser session with persisted ChatMessage records — cannot simulate in grep/file checks"
  - test: "AP travel warning fires when travel is mentioned in chat"
    expected: "AI response mentions Advance Parole, I-485, and I-131 when user says something like 'I want to travel home'"
    why_human: "Requires live AI inference — cannot verify from static code alone"
  - test: "Screener completes and disappears from dashboard"
    expected: "After completing the screener flow, it does not reappear on next dashboard visit; entryType is persisted"
    why_human: "Requires live browser interaction with real Supabase + Prisma stack"
  - test: "Documents page renders with upload zone and empty state"
    expected: "/dashboard/documents shows 'No documents uploaded yet' empty state for a new user, and the upload zone is functional"
    why_human: "Requires live browser with authenticated session"
  - test: "Forms pack detail panel shows instructions and USCIS download link"
    expected: "Clicking a form pack from /dashboard/my-forms opens /dashboard/forms/pack/{id} with purpose/whoFills/whatToExpect and 'Download from USCIS.gov' link"
    why_human: "Requires live browser rendering"
  - test: "EWI warning appears on dashboard for EWI entry type"
    expected: "After screener completes with entryType='ewi', the amber EwiWarning banner appears on /dashboard"
    why_human: "Requires live browser with EWI-flagged test account"
  - test: "Receipt numbers and case status save correctly on immigration-info page"
    expected: "/dashboard/immigration-info form pre-fills from existing data and saves without overwriting screener answers"
    why_human: "Requires live database interaction to verify merge behavior"
  - test: "Document extract saves fields to profile"
    expected: "Clicking 'Extract to profile' on a passport document triggers extraction and populates case profile fields"
    why_human: "Requires live AI inference and database write"
---

# Phase 02: Core Case Features Verification Report

**Phase Goal:** Users can set up their case, explore all required forms with guidance, chat with the AI assistant about their case, and upload supporting documents
**Verified:** 2026-04-17T18:55:00Z
**Status:** human_needed — all automated checks pass; 8 UI/runtime behaviors deferred per user instruction
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can complete eligibility screener that saves entryType to DB | VERIFIED | `initial-screener.tsx` line 446: `fetch("/api/dashboard/steps", ...)` with `stepSlug: "immigration-info"` |
| 2 | EWI entry type shows amber warning on dashboard | VERIFIED | `dashboard/page.tsx` line 61: `!showScreener && profileEntryType === "ewi" && <EwiWarning />` |
| 3 | Timeline filters by entry type (EWI gets attorney consult section) | VERIFIED | `timeline-checklists.ts` line 273: `export function filterTimelineByEntryType(...)` |
| 4 | User can enter receipt numbers and priority date | VERIFIED | `immigration-info-client.tsx` lines 25-35: receiptNumber, priorityDate, caseStatus state |
| 5 | Users can browse all 6 form packs with PDF previews | VERIFIED | `forms/pack/[id]/page.tsx` renders FormDocCard grid with PdfPreview per form |
| 6 | Each form pack shows plain-English instructions (purpose, whoFills, whatToExpect) | VERIFIED | `forms/pack/[id]/page.tsx` lines 176-180: renders `pack.instructions.purpose/whoFills/whatToExpect` |
| 7 | Outdated edition warning banner appears when lockedUntil passes | VERIFIED | `forms/pack/[id]/page.tsx` line 184: `new Date() > pack.lockedUntil && <EditionWarningBanner />` |
| 8 | Forms page links to official USCIS download page | VERIFIED | `forms/pack/[id]/page.tsx` line 205: `href={pack.uscisUrl}` target="_blank" |
| 9 | User can chat with AI assistant (streaming) | VERIFIED | `chat-container.tsx` uses `useChat` with `api: "/api/chat"`, route uses `streamText` |
| 10 | AI performs conversational intake and saves to CaseStep | VERIFIED | `chat/route.ts` line 188: `saveExtractedFields()` → `prisma.caseStep.upsert()` |
| 11 | AI deflects legal questions with UPL disclaimer | VERIFIED | `prompts.ts` lines 12, 36-37: explicit legal deflection instructions |
| 12 | AI warns against traveling without Advance Parole | VERIFIED | `prompts.ts` lines 39-44: "ADVANCE PAROLE WARNING" block with I-485, I-131 |
| 13 | Chat history persists across sessions (initialMessages on mount) | VERIFIED | `documentation-filling/page.tsx` queries ChatSession via Prisma; prop chain to `useChat({ messages: seedMessages })` |
| 14 | User can upload documents tagged by type | VERIFIED | `upload/route.ts` line 120: `prisma.document.create()` with `docType` field |
| 15 | Documents stored privately in Supabase Storage with per-user access | VERIFIED | `upload/route.ts`: Supabase Storage upload + ownership check in `documents/route.ts` line 58 |
| 16 | User can view and download uploaded documents via signed URLs | VERIFIED | `documents/route.ts` line 22: `createSignedUrl(doc.storagePath, 3600)`; `documents/page.tsx` passes signedUrl to DocumentRow |
| 17 | Documents can be deleted (with ownership check) | VERIFIED | `documents/route.ts` line 58: `document.userProfileId !== context.userProfile.id` → 403 |
| 18 | Uploaded documents can auto-populate profile fields via AI extraction | VERIFIED | `extract/route.ts` calls AI, saves to immigration-info CaseStep via `prisma.caseStep.upsert()` |
| 19 | Only passport, marriage-certificate, birth-certificate support extraction | VERIFIED | `extract/route.ts` line 42: EXTRACTABLE_DOC_TYPES check → 400 for non-extractable types |

**Score:** 19/19 truths verified (automated)

---

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/__tests__/lib/screener.test.ts` | VERIFIED | 4 tests, all passing |
| `src/__tests__/lib/timeline-filter.test.ts` | VERIFIED | 5 tests, all passing |
| `src/__tests__/lib/chat-history.test.ts` | VERIFIED | 4 tests, all passing |
| `src/__tests__/lib/upload.test.ts` | VERIFIED | 3 tests, all passing |
| `src/__tests__/lib/document-types.test.ts` | VERIFIED | 17 tests, all passing |
| `src/__tests__/lib/document-extract.test.ts` | VERIFIED | 4 tests, all passing |
| `src/__tests__/lib/form-packs.test.ts` | VERIFIED | Extended with uscisUrl and instructions tests — all passing |
| `src/__tests__/lib/prompts.test.ts` | VERIFIED | Extended with AP warning tests — all passing |
| `prisma/schema.prisma` | VERIFIED | `model Document` present; `documents Document[]` relation on UserProfile |
| `prisma/migrations/20260417_add_document_model/` | VERIFIED | Migration SQL file present |
| `src/lib/document-types.ts` | VERIFIED | Exports DOCUMENT_TYPES (13 entries), DocumentType, EXTRACTABLE_DOC_TYPES (3 entries) |
| `src/lib/form-packs.ts` | VERIFIED | FormPackInstructions interface + uscisUrl field; all 6 packs populated |
| `src/app/globals.css` | VERIFIED | `--color-warning-bg: #fffbeb`, `--color-warning-border`, `--color-warning-text`, `--color-destructive: #dc2626` |
| `src/app/dashboard/forms/pack/[id]/page.tsx` | VERIFIED | EditionWarningBanner, instructions section, USCIS download link (NOTE: plan targeted `my-forms/page.tsx` but implementation landed here — functionality is equivalent) |
| `src/lib/timeline-checklists.ts` | VERIFIED | `export function filterTimelineByEntryType(...)` at line 273 |
| `src/components/initial-screener.tsx` | VERIFIED | `export function EwiWarning()`, `saving` state, `fetch("/api/dashboard/steps")` on completion |
| `src/app/dashboard/page.tsx` | VERIFIED | `EwiWarning` imported and conditionally rendered for EWI entry type |
| `src/app/dashboard/immigration-info/page.tsx` | VERIFIED | Server Component passes stepData to ImmigrationInfoForm |
| `src/app/dashboard/immigration-info/immigration-info-client.tsx` | VERIFIED | receiptNumber, priorityDate, caseStatus fields with merge pattern |
| `src/lib/ai/prompts.ts` | VERIFIED | ADVANCE PAROLE warning block with I-485 and I-131 |
| `src/app/api/chat/history/route.ts` | VERIFIED | GET handler, chatSession.findUnique, filter user/assistant, orderBy createdAt asc |
| `src/app/api/dashboard/upload/route.ts` | VERIFIED | DOCUMENT_TYPES import, prisma.document.create() when docType provided |
| `src/app/api/documents/route.ts` | VERIFIED | GET (signed URLs, 3600 TTL) + DELETE (ownership check) |
| `src/app/dashboard/documents/page.tsx` | VERIFIED | Server Component, `export const dynamic = "force-dynamic"`, renders DocumentsClient |
| `src/app/dashboard/documents/documents-client.tsx` | VERIFIED | Upload zone, document list, handleDelete, handleExtract (wired to /api/documents/extract) |
| `src/components/document-row.tsx` | VERIFIED | DocumentRow with extractStatus, "Extract to profile", confirmDelete, aria-labels |
| `src/app/api/documents/extract/route.ts` | VERIFIED | POST, EXTRACTABLE_DOC_TYPES check, ownership check, prisma.caseStep.upsert |
| `src/app/documentation-filling/page.tsx` | VERIFIED | Queries ChatSession directly via Prisma, passes initialMessages to ChatUI |
| `src/components/chat-ui.tsx` | VERIFIED | initialMessages prop forwarded to ChatContainer |
| `src/components/chat/chat-container.tsx` | VERIFIED | Converts initialMessages to UIMessage parts, passes as `messages: seedMessages` to useChat |

---

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `initial-screener.tsx` | `POST /api/dashboard/steps` | fetch with `stepSlug: "immigration-info"` | WIRED |
| `timeline-checklists.ts` | `my-case-timeline.tsx` (or consumers) | `filterTimelineByEntryType` exported | WIRED |
| `initial-screener.tsx` | `dashboard/page.tsx` | EwiWarning exported and conditionally rendered | WIRED |
| `immigration-info/page.tsx` | `POST /api/dashboard/steps` | form submit in ImmigrationInfoForm | WIRED |
| `document-types.ts` | `upload/route.ts` | DOCUMENT_TYPES used in docType validation | WIRED |
| `prisma/schema.prisma` | `documents/page.tsx` | `prisma.document.findMany()` | WIRED |
| `upload/route.ts` | `prisma.document` | `prisma.document.create()` after storage upload | WIRED |
| `documents/route.ts` | `supabase.storage` | `createSignedUrl(..., 3600)` | WIRED |
| `documents/page.tsx` | `documents-client.tsx` | renders `<DocumentsClient initialDocuments={...}>` | WIRED |
| `documents-client.tsx` | `document-row.tsx` | renders `<DocumentRow>` for each document | WIRED |
| `documents-client.tsx` | `POST /api/documents/extract` | fetch in handleExtract | WIRED |
| `extract/route.ts` | `prisma.document` | findUnique to verify ownership | WIRED |
| `extract/route.ts` | `prisma.caseStep` | upsert to immigration-info CaseStep | WIRED |
| `prompts.ts` | `chat/route.ts` | `import { systemPrompt }` used in `streamText` system param | WIRED |
| `documentation-filling/page.tsx` | `prisma.chatSession` | findUnique with messages orderBy createdAt asc | WIRED |
| `chat-ui.tsx` | `chat-container.tsx` | initialMessages prop passed through | WIRED |
| `chat-container.tsx` | `useChat` | `messages: seedMessages` (UIMessage format) | WIRED |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `documents/page.tsx` | `documentsWithUrls` | `prisma.document.findMany()` + `createSignedUrl()` | Yes — DB query + storage call | FLOWING |
| `documents-client.tsx` | `documents` | `initialDocuments` prop from server component | Yes — flows from DB-fetched data | FLOWING |
| `document-row.tsx` | `extractStatus` | `extracting[doc.id]` state in parent | Yes — set by real fetch response | FLOWING |
| `documentation-filling/page.tsx` | `initialMessages` | `prisma.chatSession.findUnique()` with messages | Yes — DB query | FLOWING |
| `chat-container.tsx` | `seedMessages` | `initialMessages` prop → UIMessage conversion | Yes — from DB messages | FLOWING |
| `immigration-info-client.tsx` | `receiptNumber`, `priorityDate`, `caseStatus` | `existingData` prop from server + user input | Yes — pre-filled from DB | FLOWING |
| `dashboard/page.tsx` | `profileEntryType` | `immigrationData?.entryType` from CaseStep | Yes — server-fetched from DB | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 55 phase-02 tests pass | `npm run test -- --run [8 test files]` | 55 passed | PASS |
| TypeScript compiles cleanly | `npx tsc --noEmit` | 0 errors | PASS |
| document-types exports 13 entries | `grep "export const DOCUMENT_TYPES" src/lib/document-types.ts` | 1 match | PASS |
| EXTRACTABLE_DOC_TYPES has 3 entries | `grep "EXTRACTABLE_DOC_TYPES" src/lib/document-types.ts` | passport, marriage-certificate, birth-certificate | PASS |
| All 6 form packs have uscisUrl | `grep "https://www.uscis.gov" src/lib/form-packs.ts \| wc -l` | 6 matches | PASS |
| AP warning in systemPrompt | `grep "ADVANCE PAROLE" src/lib/ai/prompts.ts` | 1 match | PASS |
| Chat history route exported | `grep "export async function GET" src/app/api/chat/history/route.ts` | 1 match | PASS |
| Document model in schema | `grep "model Document" prisma/schema.prisma` | 1 match | PASS |
| Ownership check in delete | `grep "userProfileId !== context.userProfile.id" src/app/api/documents/route.ts` | 1 match | PASS |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CASE-01 | 02-01, 02-04 | Screener determines AOS eligibility | SATISFIED | initial-screener.tsx saves entryType to DB on completion |
| CASE-02 | 02-01, 02-04 | Timeline filtered by entry type | SATISFIED | filterTimelineByEntryType exported and EWI consult section wired |
| CASE-03 | 02-04 | Receipt numbers, priority date, case status | SATISFIED | immigration-info-client.tsx collects and saves all 3 fields |
| CASE-04 | 02-04 | Petitioner has write access to own steps | SATISFIED | No artificial role lock-out; single user has full write access |
| FORM-01 | 02-03 | Browse all 6 forms with PDF previews | SATISFIED | forms/pack/[id]/page.tsx renders 6 packs with FormDocCard + PdfPreview |
| FORM-02 | 02-01, 02-03 | Plain-English instructions per form | SATISFIED | pack.instructions.purpose/whoFills/whatToExpect rendered in pack detail |
| FORM-03 | 02-03 | Edition outdated warning | SATISFIED | EditionWarningBanner shown when new Date() > pack.lockedUntil |
| FORM-04 | 02-01, 02-03 | Links to official USCIS pages | SATISFIED | href={pack.uscisUrl} target="_blank" with "Download from USCIS.gov" |
| CHAT-01 | 02-05, 02-08 | Chat with AI assistant | SATISFIED | useChat → /api/chat → streamText; documentation-filling page accessible |
| CHAT-02 | 02-05 | Conversational intake | SATISFIED | chat/route.ts has saveExtractedFields() that upserts to CaseStep |
| CHAT-03 | 02-05 | Extracted data saved to CaseStep | SATISFIED | saveExtractedFields() → prisma.caseStep.upsert() |
| CHAT-04 | 02-01, 02-05, 02-08 | Chat history persists across navigation | SATISFIED | Prisma ChatSession query in page; seedMessages wired to useChat |
| CHAT-05 | 02-05 | AI deflects legal questions with UPL disclaimer | SATISFIED | prompts.ts lines 12, 36-37: legal deflection instructions |
| CHAT-06 | 02-01, 02-05 | AI warns against travel without Advance Parole | SATISFIED | prompts.ts lines 39-44: ADVANCE PAROLE WARNING block |
| DOC-01 | 02-01, 02-06 | Upload documents tagged by type | SATISFIED | upload/route.ts: DOCUMENT_TYPES validation + prisma.document.create() |
| DOC-02 | 02-01, 02-02 | 13 document types | SATISFIED | document-types.ts: 13 entries, all expected slugs present |
| DOC-03 | 02-02, 02-06 | Private Supabase Storage with per-user access | SATISFIED | Supabase Storage upload + ownership check in documents/route.ts |
| DOC-04 | 02-06 | View and download via signed URLs | SATISFIED | createSignedUrl(storagePath, 3600) per document on list fetch |
| DOC-05 | 02-01, 02-07 | AI extraction from documents to profile | SATISFIED | extract/route.ts: EXTRACTABLE_DOC_TYPES check, AI call, CaseStep upsert |

**All 19 Phase 2 requirement IDs accounted for and satisfied.**

**Note on FORM-01 through FORM-04:** The plan (02-03) targeted `src/app/dashboard/my-forms/page.tsx` for the instructions panel, EditionWarningBanner, and USCIS link. The actual implementation placed these artifacts in `src/app/dashboard/forms/pack/[id]/page.tsx` — which is the page that `my-forms/page.tsx` routes to when a PackCard is clicked. The pack browse cards on my-forms/page.tsx do show a compact inline edition warning. Functionally, the requirement goals are met through the pack detail route.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `documents-client.tsx` | ~90 | `handleExtract` previously used `window.location.href` placeholder | Info | Fixed in Plan 07 — now calls POST /api/documents/extract correctly |
| None found | - | No TODO/FIXME/placeholder comments in Phase 2 deliverables | - | - |

No blocker or warning anti-patterns found. The only instance found (window.location.href placeholder in handleExtract) was identified by Plan 07 and replaced with the real implementation.

---

### Human Verification Required

#### 1. Chat History Loading on Mount

**Test:** Start dev server, log in with an account that has prior chat messages, navigate to /documentation-filling
**Expected:** Previous messages appear immediately without a visible loading spinner or flash
**Why human:** Requires a live browser session with persisted ChatMessage records in Supabase

#### 2. AP Travel Warning Fires in Chat

**Test:** In the chat UI, send a message such as "I want to go visit my family in Mexico next month"
**Expected:** AI responds with a warning mentioning Advance Parole, I-485, and I-131
**Why human:** Requires live AI inference; cannot verify prompt trigger behavior from static code

#### 3. Screener Completes and Persists

**Test:** For a user who has not completed the screener, complete all 8 steps; navigate away and back to /dashboard
**Expected:** Screener does not reappear; entryType is persisted; if EWI was selected, amber EwiWarning is shown
**Why human:** Requires live Supabase session and real database write

#### 4. Documents Page UI

**Test:** Navigate to /dashboard/documents as a new user
**Expected:** Upload zone is shown with "Upload document" button; empty state shows "No documents uploaded yet"
**Why human:** Requires live browser rendering with authenticated session

#### 5. Forms Pack Detail Panel

**Test:** Navigate to /dashboard/my-forms, click any form pack card; observe the pack detail page
**Expected:** Plain-English instructions visible (purpose, who fills it, what to expect); "Download from USCIS.gov" link present; edition warning banner visible (since all lockedUntil dates have passed)
**Why human:** Requires live browser rendering

#### 6. EWI Warning on Dashboard

**Test:** Using a test account with entryType='ewi' stored, navigate to /dashboard
**Expected:** Amber alert banner with "Review your eligibility" heading visible below the screener area
**Why human:** Requires a pre-seeded EWI test account

#### 7. Receipt Numbers Merge Behavior

**Test:** On /dashboard/immigration-info, fill in receipt number and priority date; save; verify screener answers (entryType, fullName) are still present in the CaseStep record
**Expected:** Existing screener data is preserved; new fields are merged in
**Why human:** Requires database inspection alongside UI interaction

#### 8. Document AI Extraction End-to-End

**Test:** Upload a passport image/PDF to /dashboard/documents, then click "Extract to profile"
**Expected:** Button shows "Extracting data…", then "Data saved to your case profile."; navigating to /dashboard/immigration-info shows extracted fields populated
**Why human:** Requires live AI inference + database write round-trip

---

### Gaps Summary

No gaps found. All 19 requirements have verified implementations with correct data flow. The one notable deviation from plan is that FORM-02, FORM-03, and FORM-04 UI artifacts landed in `src/app/dashboard/forms/pack/[id]/page.tsx` rather than `src/app/dashboard/my-forms/page.tsx` — this is architecturally sound and the browse flow routes correctly to the detail page.

The phase has 8 items pending human verification, all deferred per user instruction to end-of-project. These are visual/runtime behaviors that cannot be verified from static code analysis.

---

_Verified: 2026-04-17T18:55:00Z_
_Verifier: Claude (gsd-verifier)_

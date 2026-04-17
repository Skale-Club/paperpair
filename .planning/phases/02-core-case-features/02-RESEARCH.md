# Phase 2: Core Case Features - Research

**Researched:** 2026-04-17
**Domain:** Next.js 15 + Supabase Storage + Prisma + Vercel AI SDK — document uploads, chat history, form enrichment, screener wiring
**Confidence:** HIGH (all findings verified against actual codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Screener Completion (CASE-01, CASE-02)**
- D-01: Entry type saved to `CaseStep.data` under `stepSlug = "immigration-info"`. Screener disappears and dashboard renders normally on complete.
- D-02: EWI users get inline warning but are NOT blocked. UPL disclaimer already covers legal risk.
- D-03: Timeline step visibility adapts based on entry type. Logic lives in `src/lib/timeline-checklists.ts` or a new sibling utility — Claude's discretion on exact location.
- D-04: CASE-03 (receipt numbers, priority date) stored in `CaseStep.data` under `stepSlug = "immigration-info"`. No new table.

**Forms Page (FORM-01, FORM-02, FORM-03, FORM-04)**
- D-05: Plain-English instructions live inside the existing pack detail panel at `/dashboard/forms/pack/[id]/page.tsx`. No new page or route.
- D-06: Edition warning rendered as prominent yellow banner when `new Date() > pack.lockedUntil`.
- D-07: USCIS download link is a plain external `<a href>` pointing to uscis.gov. Each `FormPack` entry gets a `uscisUrl: string` field.

**Document Uploads (DOC-01 through DOC-05)**
- D-08: AI extraction (DOC-05) runs on demand — user clicks "Extract to profile" button. Not automatic on upload.
- D-09: Document type tags: `passport`, `birth-certificate`, `marriage-certificate`, `divorce-decree`, `i-94`, `visa`, `tax-return`, `bank-statement`, `employment-letter`, `police-clearance`, `medical-exam`, `photo`, `other`.
- D-10: Documents stored under `uploads/{userId}/{timestamp}-{filename}` in Supabase Storage private bucket `user-documents`. Access via signed URLs (1-hour TTL). Extend existing upload route with doc-type tagging.
- D-11: Documents page shows list view (not gallery). Each row: filename, type tag, upload date, signed-URL download button, delete button.

**Role Access (CASE-04)**
- D-12: Solo user = full write access to all steps. Role-based locking only activates when a second user joins via invite. Single-user path remains friction-free.

**Chat (CHAT-04, CHAT-06)**
- D-13: Chat history loads on mount from persisted `ChatSession`/`ChatMessage` records via a new `GET /api/chat/history` endpoint, passed as `initialMessages` to `useChat`.
- D-14: AP travel warning added to system prompt in `src/lib/ai/prompts.ts` — standing instruction to warn whenever travel/trip/visit abroad appears in conversation.

### Claude's Discretion
- Timeline step filtering logic location (`timeline-checklists.ts` extension vs new utility)
- Exact panel layout for form instructions (spacing, typography, section order)
- Document list row design (icon, truncation, responsive behavior)
- `GET /api/chat/history` response shape and pagination (if any)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CASE-01 | User completes initial eligibility screener to determine if AOS applies | Screener wizard already built (8 steps); save-on-complete to `immigration-info` CaseStep already wired; only EWI warning + entry-type persistence needs confirming |
| CASE-02 | Timeline steps shown/hidden based on entry type | `timeline-checklists.ts` has all 19 sections; needs entry-type filter function reading `entryType` from CaseStep |
| CASE-03 | Case status fields stored on profile (receipt numbers, priority date, case status) | Stored in `CaseStep.data["immigration-info"]` JSON blob; no schema migration needed |
| CASE-04 | Petitioner has write access to their own steps | Single-user path is already unrestricted; viewer logic in `getCurrentUserAndProfileWithViewerSupport()` handles the rest |
| FORM-01 | User can browse all 6 required AOS forms with PDF previews | PackCard grid + `/dashboard/forms/pack/[id]/page.tsx` already built; browsing works |
| FORM-02 | Each form shows plain-English instructions and what to expect | Pack detail page needs an instructions section added; `FormPack` type needs `instructions` field |
| FORM-03 | User is warned if a form edition may be outdated | `lockedUntil` field exists in `FormPack`; PackCard already has a small amber note; needs prominent banner in pack detail |
| FORM-04 | Forms page links directly to official USCIS download pages | `uscisUrl` field must be added to `FormPack` interface and populated for all 6 packs |
| CHAT-01 | User can chat with AI assistant about their case | Streaming chat fully functional at `/documentation-filling`; no net-new work |
| CHAT-02 | AI performs conversational intake (names, dates, addresses) | `systemPrompt` already directs collection of 9 fields; extraction heuristic + Google fallback in place |
| CHAT-03 | Extracted data saved to user's CaseStep profile automatically | `saveExtractedFields()` in chat route already upserts to correct slugs on `onFinish` |
| CHAT-04 | Chat history persists across navigation and sessions | `ChatSession`/`ChatMessage` models exist in schema; need `GET /api/chat/history` endpoint + `initialMessages` wire-up |
| CHAT-05 | AI deflects legal questions and includes UPL disclaimer | `systemPrompt` already has legal guardrail; `UplDisclaimer` component on chat page |
| CHAT-06 | AI warns against traveling without Advance Parole when topic arises | Single sentence appended to `systemPrompt` in `src/lib/ai/prompts.ts` |
| DOC-01 | User can upload supporting documents | Upload route at `/api/dashboard/upload/route.ts` works; needs `docType` field extension |
| DOC-02 | Uploaded documents tagged by type | Enum of 13 types; add `docType` to upload body Zod schema |
| DOC-03 | Documents stored privately with per-user access control | Supabase Storage `user-documents` bucket already in use; path is `{userId}/{stepSlug}/...`; needs `Document` Prisma model for list queries |
| DOC-04 | User can view and download uploaded documents via signed URLs | `supabase.storage.createSignedUrl()` pattern already used in generated-pdfs; replicate for user-documents |
| DOC-05 | Uploaded documents used to auto-populate form fields via AI extraction | On-demand: POST to a new `/api/documents/extract` route that calls AI with file content |
</phase_requirements>

---

## Summary

Phase 2 is primarily wiring and enrichment work on top of a solid Phase 1 foundation. The screener, upload, and chat routes already exist and work — this phase completes each capability to production-ready quality.

The four capability areas have different completion states:
- **Screener (CASE-01/02):** The wizard UI is complete with 8 steps and save-on-complete already wired. What's missing: the EWI inline warning component shown after screener dismissal, and the timeline entry-type filter that reads `entryType` from CaseStep.
- **Forms (FORM-01–04):** PackCard browsing works. The pack detail page at `/dashboard/forms/pack/[id]/page.tsx` needs a new instructions section, the `FormPack` type needs `uscisUrl` and `instructions` fields populated, and the edition warning needs to be upgraded from the small PackCard note to a prominent banner inside the detail panel.
- **Documents (DOC-01–05):** The upload route works and writes to Supabase Storage. What's missing: a `Document` Prisma model (currently files are stored only as JSON blobs inside `CaseStep.data`), the document list page at `/dashboard/documents/`, `docType` extension to the upload route, signed-URL download endpoint, delete endpoint, and the on-demand AI extraction route.
- **Chat (CHAT-04/06):** `ChatSession`/`ChatMessage` models exist with data persisted on every exchange. What's missing: the `GET /api/chat/history` endpoint and passing `initialMessages` to `useChat`, plus the AP travel warning in `systemPrompt`.

**Primary recommendation:** Implement in order: (1) Document model + list page + upload extension (most net-new code), (2) Chat history endpoint + wire-up (small surface, high user impact), (3) Forms pack detail instructions (data-only + UI), (4) Screener EWI warning + timeline filter (light touch on existing wizard).

---

## Standard Stack

### Core (already in project — no installs needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^15.5.14 | Server Components, Route Handlers, Server Actions | Project constraint |
| Prisma | ^6.4.1 | Document model, ChatMessage queries | Already in use |
| @supabase/ssr | ^0.8.0 | Server-side Supabase client for Storage signed URLs | Already in use |
| @supabase/supabase-js | ^2.97.0 | Storage upload, delete, signed URL generation | Already in use |
| Vercel AI SDK (ai + @ai-sdk/react) | ^6.0.137 / ^3.0.139 | `useChat` with `initialMessages`, streaming | Already in use |
| @ai-sdk/google | ^3.0.53 | Document content extraction via Gemini | Already in use |
| zod | ^4.3.6 | Upload route body validation (`docType` extension) | Already in use |
| Tailwind CSS | ^3.4.17 | All new UI components | Project constraint |

### No New Dependencies Required
All capabilities in Phase 2 are achievable with the existing stack. No new `npm install` commands needed.

---

## Architecture Patterns

### Established Patterns to Follow

#### Server Component page → Client Component for interactivity
```typescript
// Pattern: Server Component fetches initial data, passes to Client Component
// Source: src/app/dashboard/page.tsx (already used)
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) redirect("/login");
  // Fetch documents from Prisma
  const documents = await prisma.document.findMany({
    where: { userProfileId: context.userProfile.id },
    orderBy: { uploadedAt: "desc" },
  });
  return <DocumentsClient initialDocuments={documents} />;
}
```

#### Route Handler auth check pattern
```typescript
// Pattern: auth first, Zod validation, then business logic
// Source: src/app/api/dashboard/upload/route.ts (already used)
export async function POST(request: Request) {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Zod parse body...
  // business logic...
}
```

#### CaseStep upsert
```typescript
// Pattern: merge new data into existing JSON blob
// Source: src/app/api/chat/route.ts (already used)
await prisma.caseStep.upsert({
  where: { userProfileId_stepSlug: { userProfileId, stepSlug } },
  create: { userProfileId, stepSlug, status: StepStatus.IN_PROGRESS, data: newData },
  update: { data: { ...existingData, ...newData } },
});
```

#### Supabase Storage signed URL
```typescript
// Pattern: private bucket + signed URL for download
// Source: src/app/api/chat/route.ts generatePdfs() (already used)
const { data: signedData } = await supabase.storage
  .from("user-documents")
  .createSignedUrl(storagePath, 3600); // 1-hour TTL per D-10
const downloadUrl = signedData?.signedUrl ?? null;
```

#### useChat with initialMessages
```typescript
// Pattern for CHAT-04 — pass persisted messages on mount
"use client";
import { useChat } from "@ai-sdk/react";

export function ChatContainer({ initialMessages }: { initialMessages: Message[] }) {
  const { messages, input, handleSubmit } = useChat({
    api: "/api/chat",
    initialMessages, // hydrates from DB on mount
  });
  // ...
}
```

### Recommended Project Structure for Phase 2 Additions

```
src/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   ├── route.ts           # existing — no change
│   │   │   └── history/
│   │   │       └── route.ts       # NEW — GET chat history
│   │   ├── dashboard/
│   │   │   └── upload/
│   │   │       └── route.ts       # existing — extend with docType
│   │   └── documents/
│   │       ├── route.ts           # NEW — GET list + DELETE
│   │       └── extract/
│   │           └── route.ts       # NEW — POST AI extraction
│   ├── dashboard/
│   │   └── documents/
│   │       └── page.tsx           # NEW — document list page (replaces stub)
│   └── forms/
│       └── pack/
│           └── [id]/
│               └── page.tsx       # existing — add instructions section
├── components/
│   ├── initial-screener.tsx       # existing — add EWI warning
│   └── document-row.tsx           # NEW — single document row component
├── lib/
│   ├── form-packs.ts              # existing — add uscisUrl + instructions fields
│   ├── ai/
│   │   └── prompts.ts             # existing — append AP travel warning
│   └── document-types.ts          # NEW — 13 doc type enum/constants
└── prisma/
    └── schema.prisma              # existing — add Document model
```

### Anti-Patterns to Avoid
- **Storing documents only in CaseStep.data JSON blob:** The existing upload route appends file metadata to `CaseStep.data["files"]`. This makes listing, deleting, and per-document operations impossible. A dedicated `Document` Prisma model is required.
- **Auto-running AI extraction on upload:** Per D-08, this must be on-demand. Auto-extraction adds latency and cost without user consent.
- **Serving documents without signed URLs:** Never expose raw Supabase Storage paths. Always generate short-lived signed URLs.
- **Skipping `export const dynamic = "force-dynamic"` on dashboard pages:** Without this, Next.js caches the page and documents/chat history won't refresh.
- **Putting `initialMessages` fetch in the client component:** Fetch in the server component and pass as props. Avoids a visible loading flash and keeps the pattern consistent with other dashboard pages.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Document storage access control | Custom auth middleware for file paths | Supabase Storage RLS + signed URLs | RLS policies already configured; signed URLs expire automatically |
| Chat message streaming | Custom SSE implementation | Vercel AI SDK `streamText` + `toUIMessageStreamResponse` | Already working; `useChat` handles reconnect, buffering, abort |
| File type validation | Client-side MIME check only | `getMagicMime()` from `src/lib/mime.ts` (magic bytes) | Client MIME can be spoofed; magic byte check is already implemented |
| AI extraction for documents | New extraction pipeline | Extend `extractWithGoogle()` pattern from chat route | Same Gemini endpoint; only system prompt differs |
| Request body validation | Manual type guards | Zod schema + `.safeParse()` | Already the project pattern for all route handlers |

**Key insight:** The upload, storage, and AI extraction infrastructure is already built for chat. Document features reuse all of it with minor extensions.

---

## Common Pitfalls

### Pitfall 1: Document storage path mismatch (D-10 path vs. existing upload path)
**What goes wrong:** The existing upload route uses `{userId}/{stepSlug}/{timestamp}-{filename}`. Decision D-10 specifies `uploads/{userId}/{timestamp}-{filename}`. These are different paths in the same bucket.
**Why it happens:** The existing route was designed for step-scoped file attachments, not a standalone document library.
**How to avoid:** For the new `Document` model records, use `uploads/{userId}/{timestamp}-{filename}` as specified in D-10. The old step-scoped upload remains for backward compatibility. The `Document` model tracks `storagePath` so the query route knows exactly where to fetch each file.
**Warning signs:** Signed URL generation returning 404 — check the storage path matches what was written during upload.

### Pitfall 2: `initialMessages` format mismatch with `useChat`
**What goes wrong:** `ChatMessage` records in the DB have `{ role: string, content: string, createdAt }`. Vercel AI SDK `useChat` expects `Message[]` where each message has `{ id, role, content, parts? }`.
**Why it happens:** DB schema uses a plain `role: String` (not enum), and AI SDK has its own message type.
**How to avoid:** The `GET /api/chat/history` endpoint should transform DB records to the AI SDK `Message` format: assign a stable `id` (use the `id` from `ChatMessage`), map `role` to `"user" | "assistant"`, and set `content`. Filter out any non-user/assistant roles before returning.
**Warning signs:** `useChat` silently ignoring `initialMessages`, or React type errors on the `messages` prop.

### Pitfall 3: `Document` model migration required before list page works
**What goes wrong:** The documents list page queries `prisma.document.findMany()` but the `Document` model doesn't exist in schema yet. The page throws at runtime.
**Why it happens:** The upload route currently writes file metadata to `CaseStep.data` JSON, not a dedicated table.
**How to avoid:** Create the `Document` Prisma model and run migration SQL before any route code tries to use it. Plan ordering: migration first (Wave 0 or Wave 1), then routes and UI.
**Warning signs:** Prisma client throws `Cannot read properties of undefined (reading 'findMany')` for `prisma.document`.

### Pitfall 4: Screener EWI warning shown to non-EWI users
**What goes wrong:** The warning renders before the screener has fully dismissed, or the entry-type comparison uses the wrong field path.
**Why it happens:** `initial-screener.tsx` saves `entryType` at step 7 (the last step). The `setOpen(false)` call happens in the `finally` block. If the warning is keyed off local state instead of the API response, it may flash for all users briefly.
**How to avoid:** Show `EwiWarning` only after confirming `answers.entryType === "ewi"` AND the save succeeded (not in `finally`, but in the `if (response.ok)` branch). The warning should be rendered in the dashboard shell after screener dismissal (where `immigrationData.entryType` from the server is authoritative), not inside the screener modal.
**Warning signs:** Warning appearing momentarily for overstay users, or warning appearing before screener saves.

### Pitfall 5: Pack detail page already a client component with localStorage
**What goes wrong:** `/dashboard/forms/pack/[id]/page.tsx` is a `"use client"` component. Adding static instructions content there is straightforward, but the `uscisUrl` field must come from `form-packs.ts` (server-side data file), not from a fetch.
**Why it happens:** The pack detail page already imports `FORM_PACKS` directly. The `FormPack` interface just needs `uscisUrl` and `instructions` added and the data populated.
**How to avoid:** Extend the `FormPack` interface in `form-packs.ts`. The page already has access to `pack` via `FORM_PACKS.find(p => p.id === id)`. No API call needed.
**Warning signs:** TypeScript errors on the `pack.uscisUrl` access if the interface isn't updated first.

### Pitfall 6: Supabase delete requires the exact storage path
**What goes wrong:** Document delete fails silently because the path used in `supabase.storage.remove([path])` doesn't match the stored `storagePath` in the `Document` model.
**Why it happens:** Storage paths are case-sensitive and must be exact strings.
**How to avoid:** Store `storagePath` as a top-level field in the `Document` Prisma model (not buried in JSON). The delete route reads `document.storagePath` and passes it verbatim to `supabase.storage.from("user-documents").remove([storagePath])`.

---

## Code Examples

### Document Prisma Model (to add to schema.prisma)
```prisma
// Add to prisma/schema.prisma
model Document {
  id            String      @id @default(cuid())
  userProfileId String
  filename      String
  storagePath   String
  docType       String      // one of the 13 doc type slugs
  mimeType      String
  sizeBytes     Int
  uploadedAt    DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  userProfile   UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
}
// Also add: documents Document[] to UserProfile model
```

### GET /api/chat/history endpoint pattern
```typescript
// src/app/api/chat/history/route.ts
import { NextResponse } from "next/server";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await prisma.chatSession.findUnique({
    where: { userProfileId: context.userProfile.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) return NextResponse.json({ messages: [] });

  // Transform to AI SDK Message format
  const messages = session.messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  return NextResponse.json({ messages });
}
```

### Document type enum
```typescript
// src/lib/document-types.ts
export const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "birth-certificate", label: "Birth Certificate" },
  { value: "marriage-certificate", label: "Marriage Certificate" },
  { value: "divorce-decree", label: "Divorce Decree" },
  { value: "i-94", label: "I-94 Record" },
  { value: "visa", label: "Visa" },
  { value: "tax-return", label: "Tax Return" },
  { value: "bank-statement", label: "Bank Statement" },
  { value: "employment-letter", label: "Employment Letter" },
  { value: "police-clearance", label: "Police Clearance" },
  { value: "medical-exam", label: "Medical Exam (I-693)" },
  { value: "photo", label: "Passport Photo" },
  { value: "other", label: "Other" },
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number]["value"];

// Types that support AI extraction (DOC-05)
export const EXTRACTABLE_DOC_TYPES: DocumentType[] = [
  "passport",
  "marriage-certificate",
  "birth-certificate",
];
```

### FormPack interface extension
```typescript
// src/lib/form-packs.ts — extend FormPack interface
export interface FormPackInstructions {
  purpose: string;        // 1-2 sentences — what this form is for
  whoFills: string;       // "Petitioner" | "Beneficiary" | "Both"
  whatToExpect: string;   // paragraph about the process
}

export interface FormPack {
  id: string;
  label: string;
  detailLabel: string;
  coverPdfUrl: string;
  forms: FormItem[];
  editionDate: string;
  lockedUntil: Date;
  uscisUrl: string;          // NEW — direct USCIS.gov link
  instructions: FormPackInstructions; // NEW — plain-English content
}
```

### AP travel warning system prompt addition
```typescript
// src/lib/ai/prompts.ts — append to systemPrompt
// Add after existing legal guardrail block:
`
ADVANCE PAROLE WARNING: If the user mentions travel, a trip, visiting another country, 
leaving the US, or flying internationally in any context, immediately warn them:
"Important: Do NOT travel outside the US while your I-485 is pending without an 
approved Advance Parole document (Form I-131). Leaving without it will likely 
abandon your green card application. Always check with an immigration attorney 
before any international travel."
`
```

---

## State of the Art

| Old Approach | Current Approach | Relevant Here |
|--------------|------------------|---------------|
| `localStorage` for screener state | `CaseStep.data` in PostgreSQL | Phase 1 completed this; screener save is already correct |
| Files stored as JSON in `CaseStep.data` | Dedicated `Document` model | Phase 2 introduces this upgrade |
| No chat history on page load | `initialMessages` from `GET /api/chat/history` | Phase 2 completes CHAT-04 |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified — all services already operational from Phase 1; Supabase Storage `user-documents` bucket confirmed in use by the existing upload route)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.1 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CASE-01 | Screener save-on-complete writes to `immigration-info` CaseStep | unit | `npx vitest run src/__tests__/lib/screener.test.ts -x` | ❌ Wave 0 |
| CASE-02 | Timeline filter hides EWI steps for lawful-entry users and shows them for EWI | unit | `npx vitest run src/__tests__/lib/timeline-filter.test.ts -x` | ❌ Wave 0 |
| CASE-03 | Receipt number fields stored in `immigration-info` CaseStep data | unit | `npx vitest run src/__tests__/lib/screener.test.ts -x` | ❌ (same file) |
| FORM-02 | `FormPack.instructions` field populated for all 6 packs | unit | `npx vitest run src/__tests__/lib/form-packs.test.ts -x` | ✅ (extend existing) |
| FORM-03 | Edition warning shown when `new Date() > pack.lockedUntil` | unit | `npx vitest run src/__tests__/lib/form-packs.test.ts -x` | ✅ (extend existing) |
| FORM-04 | All 6 FormPacks have non-empty `uscisUrl` field | unit | `npx vitest run src/__tests__/lib/form-packs.test.ts -x` | ✅ (extend existing) |
| CHAT-04 | `GET /api/chat/history` returns messages in AI SDK format | unit | `npx vitest run src/__tests__/lib/chat-history.test.ts -x` | ❌ Wave 0 |
| CHAT-06 | AP travel warning present in `systemPrompt` | unit | `npx vitest run src/__tests__/lib/prompts.test.ts -x` | ✅ (extend existing) |
| DOC-01 | Upload route accepts `docType` field and returns it in response | unit | `npx vitest run src/__tests__/lib/upload.test.ts -x` | ❌ Wave 0 |
| DOC-02 | `DOCUMENT_TYPES` array has all 13 entries; `EXTRACTABLE_DOC_TYPES` subset correct | unit | `npx vitest run src/__tests__/lib/document-types.test.ts -x` | ❌ Wave 0 |
| DOC-03 | `Document` model has `userProfileId` foreign key (schema check) | unit | `npx vitest run src/__tests__/lib/document-types.test.ts -x` | ❌ (same file) |
| DOC-04 | Signed URL endpoint returns 401 for wrong user (manual) | manual | — | — |
| DOC-05 | Extract route returns fields for passport doc type | unit | `npx vitest run src/__tests__/lib/document-extract.test.ts -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lib/screener.test.ts` — covers CASE-01, CASE-03 (screener save + status field storage)
- [ ] `src/__tests__/lib/timeline-filter.test.ts` — covers CASE-02 (entry-type filtering function)
- [ ] `src/__tests__/lib/chat-history.test.ts` — covers CHAT-04 (history API response format)
- [ ] `src/__tests__/lib/upload.test.ts` — covers DOC-01 (docType field in upload schema)
- [ ] `src/__tests__/lib/document-types.test.ts` — covers DOC-02, DOC-03 (enum completeness)
- [ ] `src/__tests__/lib/document-extract.test.ts` — covers DOC-05 (extraction route contract)

Existing test files to extend (no new file needed):
- `src/__tests__/lib/form-packs.test.ts` — add assertions for `uscisUrl` and `instructions` on all 6 packs (FORM-02, FORM-03, FORM-04)
- `src/__tests__/lib/prompts.test.ts` — add assertion that AP travel warning text is present (CHAT-06)

---

## Open Questions

1. **Documents page route collision**
   - What we know: `src/app/dashboard/documents/` exists with a `gather/page.tsx` sub-route (document checklist). There is no `page.tsx` at the documents root.
   - What's unclear: Should the new upload/list page live at `/dashboard/documents/` (replacing or co-existing with `gather/`) or at a new route like `/dashboard/documents/uploads/`?
   - Recommendation: Create `src/app/dashboard/documents/page.tsx` as the new upload/list page. The `gather/` sub-route remains for the document checklist (different purpose). The sidebar can link to both. No routes are removed.

2. **Screener "STEP_COUNT" is 8 but only step 7 is `EntryTypeStep`**
   - What we know: Steps are 0 (welcome) + 1-7 (data) = 8 shown steps, but `STEP_COUNT = 8`. Step 7 calls `onFinish` directly (no `goNext`). There is no step 8 rendered in JSX.
   - What's unclear: The context says "8-step screener" and `STEP_COUNT = 8`, but only 7 data steps are rendered (steps 1–7). Progress dots go 1–8 but step 8 never renders.
   - Recommendation: The EWI warning should be shown after successful save (after `setOpen(false)`) — inline on the dashboard, not inside the modal as step 8. This is consistent with D-02 ("inline warning... not a modal") and avoids the off-by-one.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/components/initial-screener.tsx` — full 8-step wizard, finish() save logic
- Direct code inspection: `src/app/api/dashboard/upload/route.ts` — upload flow, storage path, CaseStep upsert
- Direct code inspection: `src/app/api/chat/route.ts` — full streaming chat, extraction, ChatMessage persistence
- Direct code inspection: `src/lib/ai/prompts.ts` — systemPrompt current contents
- Direct code inspection: `src/lib/form-packs.ts` — FormPack interface, all 6 pack definitions
- Direct code inspection: `prisma/schema.prisma` — all models; confirmed no `Document` model exists
- Direct code inspection: `src/app/dashboard/forms/pack/[id]/page.tsx` — pack detail page current state
- Direct code inspection: `src/__tests__/` — all existing test files
- `.planning/phases/02-core-case-features/02-CONTEXT.md` — locked decisions D-01 to D-14
- `.planning/phases/02-core-case-features/02-UI-SPEC.md` — component inventory, interaction contracts

### Secondary (MEDIUM confidence)
- Vercel AI SDK `useChat` `initialMessages` prop: confirmed via code usage in `chat-container.tsx` which uses `useChat` from `@ai-sdk/react`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in `package.json` and codebase
- Architecture: HIGH — all patterns verified against working Phase 1 code
- Pitfalls: HIGH — all pitfalls identified from direct code inspection of the relevant files
- Validation: HIGH — vitest infrastructure confirmed operational from Phase 1

**Research date:** 2026-04-17
**Valid until:** 2026-06-01 (stable stack — no fast-moving dependencies)

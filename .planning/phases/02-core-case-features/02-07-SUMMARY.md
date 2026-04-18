---
phase: 02-core-case-features
plan: "07"
subsystem: api, ui
tags: [ai-extraction, supabase-storage, prisma, next.js, tailwind]

# Dependency graph
requires:
  - phase: 02-02
    provides: Document Prisma model, document-types.ts with EXTRACTABLE_DOC_TYPES
  - phase: 02-06
    provides: DocumentsClient, DocumentRow, /api/documents route, document library page

provides:
  - POST /api/documents/extract — on-demand AI field extraction from uploaded documents
  - extractStatus prop on DocumentRow with loading/success/error states
  - handleExtract wired in DocumentsClient to call the extraction API

affects:
  - verify-work (DOC-05 acceptance)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "generateText (non-streaming) used for document field extraction via Google Gemini"
    - "AI SDK FilePart uses mediaType (not mimeType) property for base64 file uploads"
    - "extractStatus per-document state tracked in DocumentsClient as Record<string, 'loading'|'success'|'error'>"
    - "Success state auto-clears after 3 seconds via setTimeout"

key-files:
  created:
    - src/app/api/documents/extract/route.ts
  modified:
    - src/app/dashboard/documents/documents-client.tsx
    - src/components/document-row.tsx

key-decisions:
  - "AI SDK FilePart.mediaType (not .mimeType) is the correct property for base64 file content"
  - "Used getLanguageModel('google/gemini-2.0-flash') without user key fallback — extraction is an admin-key operation"
  - "Extraction results merge with existing immigration-info CaseStep data via upsert (not overwrite)"

requirements-completed: [DOC-05]

# Metrics
duration: 15min
completed: 2026-04-17
---

# Phase 02 Plan 07: AI Document Extraction Summary

**POST /api/documents/extract with Gemini AI field extraction, ownership check, CaseStep upsert, and DocumentRow loading/success/error feedback states**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-17T22:07:28Z
- **Completed:** 2026-04-17T22:22:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created POST /api/documents/extract route that: validates auth, verifies document ownership, checks docType is extractable, downloads file from Supabase Storage, calls Gemini via generateText with base64 file content, parses JSON from AI response, upserts extracted fields into immigration-info CaseStep
- Updated DocumentsClient to replace the placeholder `handleExtract` with a real POST fetch that tracks per-document extraction state
- Updated DocumentRow to accept `extractStatus` prop and show "Extracting data…" / "Data saved to your case profile." / "Extraction failed. Try again or enter the information manually in your case profile." based on status

## Task Commits

1. **Task 1: Create POST /api/documents/extract route** - `b01c117` (feat)
2. **Task 2: Wire Extract to profile button in DocumentsClient** - `8178163` (feat)

## Files Created/Modified
- `src/app/api/documents/extract/route.ts` - Full extraction route with auth, ownership, type validation, Supabase download, AI call, CaseStep upsert
- `src/app/dashboard/documents/documents-client.tsx` - extracting state, real handleExtract, extractStatus passed to DocumentRow
- `src/components/document-row.tsx` - extractStatus prop, disabled state, and three-state button text

## Decisions Made
- AI SDK v6 `FilePart` uses `mediaType` property (not `mimeType`) — caught during TypeScript check
- `getLanguageModel("google/gemini-2.0-flash")` called without user key — extraction is treated as an admin-keyed operation since it processes sensitive identity documents
- Per D-08, extraction is on-demand (user clicks button) not automatic — the route only runs when explicitly called

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect FilePart property name in AI SDK**
- **Found during:** Task 1 (TypeScript compile check)
- **Issue:** Plan template used `mimeType` as the property name on FilePart, but AI SDK v6 uses `mediaType`
- **Fix:** Changed `mimeType: mediaType` to `mediaType: mediaType` in the generateText call
- **Files modified:** `src/app/api/documents/extract/route.ts`
- **Commit:** b01c117

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Zero scope change — single property name correction.

## Known Stubs
None — extraction route is fully wired end-to-end.

## User Setup Required
None — uses admin-configured Google AI key already set up in `ai_provider_keys` Supabase table.

## Self-Check: PASSED
- `src/app/api/documents/extract/route.ts` — exists
- `b01c117` — commit found in git log
- `8178163` — commit found in git log
- Tests pass: 4/4 in document-extract.test.ts
- TypeScript: 0 errors

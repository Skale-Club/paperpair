---
phase: 02-core-case-features
plan: "06"
subsystem: api, ui, database
tags: [prisma, supabase, storage, signed-urls, next.js, tailwind]

# Dependency graph
requires:
  - phase: 02-02
    provides: Document Prisma model, document-types.ts with DOCUMENT_TYPES and EXTRACTABLE_DOC_TYPES

provides:
  - Extended POST /api/dashboard/upload route persisting Document records with docType
  - GET /api/documents returning documents list with 1-hour signed URLs
  - DELETE /api/documents with ownership check and Supabase Storage removal
  - /dashboard/documents page (Server Component) with server-side document fetch
  - DocumentsClient (Client Component) with upload zone and document list
  - DocumentRow component with type badge, download, inline delete confirmation, extract button

affects:
  - 02-07 (DOC-05 extraction — imports DocumentsClient, uses /dashboard/documents/{id}/extract)
  - verify-work (DOC-01 through DOC-04 acceptance)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Document library upload uses D-10 path uploads/{userId}/{timestamp}-{filename}"
    - "Signed URLs generated per request (1-hour TTL, not stored)"
    - "Inline delete confirmation with 5-second auto-revert via setTimeout"
    - "Server Component fetches initial documents, passes as props to Client Component"

key-files:
  created:
    - src/app/api/documents/route.ts
    - src/app/dashboard/documents/page.tsx
    - src/app/dashboard/documents/documents-client.tsx
    - src/components/document-row.tsx
  modified:
    - src/app/api/dashboard/upload/route.ts

key-decisions:
  - "Document library uploads detected by stepSlug=documents + docType present; uses D-10 storage path (uploads/{userId}/{...}) instead of step-scoped path"
  - "prisma generate run at task time because Document model existed in schema but Prisma client types were stale"
  - "Extract to profile navigates to /dashboard/documents/{id}/extract (Plan 07 dependency)"

patterns-established:
  - "Route A: documents upload path — stepSlug=documents + docType triggers Document.create() and D-10 path"
  - "Route B: step-scoped upload path — existing behavior unchanged for all non-documents stepSlugs"

requirements-completed: [DOC-01, DOC-02, DOC-03, DOC-04]

# Metrics
duration: 10min
completed: 2026-04-17
---

# Phase 02 Plan 06: Document Management System Summary

**Document upload-list-delete system: extended upload route persisting Document records, GET/DELETE API with ownership checks and signed URLs, and full documents page with upload zone and DocumentRow component**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-17T21:55:00Z
- **Completed:** 2026-04-17T22:05:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Extended POST /api/dashboard/upload to create Document Prisma records when docType is provided, using the D-10 storage path
- Created GET /api/documents returning full document list with per-document signed URLs (1-hour TTL)
- Created DELETE /api/documents with ownership check — returns 403 if user does not own the document
- Built /dashboard/documents page as Server Component fetching docs with signed URLs server-side
- Created DocumentsClient with upload zone (file picker -> docType selector -> upload flow) and document list
- Created DocumentRow with filename, type badge, upload date, download link, inline 5-second delete confirmation, and conditional "Extract to profile" button for extractable doc types

## Task Commits

1. **Task 1: Extend upload route + create documents API** - `5eeaff1` (feat)
2. **Task 2: Build documents page, DocumentsClient, and DocumentRow** - `e44f5ef` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified
- `src/app/api/dashboard/upload/route.ts` - Added DOCUMENT_TYPES import, isDocLibraryUpload detection, D-10 path, prisma.document.create() on doc library uploads
- `src/app/api/documents/route.ts` - GET (list with signed URLs) and DELETE (ownership check + storage removal)
- `src/app/dashboard/documents/page.tsx` - Server Component; fetches documents and signed URLs server-side, passes to DocumentsClient
- `src/app/dashboard/documents/documents-client.tsx` - Upload zone, document list, upload/delete/extract interactions
- `src/components/document-row.tsx` - DocumentRow: type badge, download anchor, inline delete confirmation, extract button

## Decisions Made
- Document library uploads are detected by the combination of `stepSlug="documents"` (a valid DashboardStepSlug) + `docType` present — no new route needed
- `prisma generate` was run because Document model existed in schema.prisma (added in Plan 02) but the Prisma client types were stale and did not expose `prisma.document`
- "Extract to profile" navigates to `/dashboard/documents/${id}/extract` — the actual extraction route is built in Plan 07

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ran prisma generate to update stale Prisma client types**
- **Found during:** Task 1 (upload route extension)
- **Issue:** `prisma.document` did not exist on PrismaClient despite Document model being in schema.prisma from Plan 02 — `npx tsc --noEmit` reported TS2339 errors
- **Fix:** Ran `npx prisma generate` to regenerate the Prisma client with Document model types
- **Files modified:** node_modules/@prisma/client (generated, not committed)
- **Verification:** TypeScript compiled cleanly after generate
- **Committed in:** 5eeaff1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for TypeScript correctness. No scope creep.

## Issues Encountered
None beyond the stale Prisma client which was resolved via `prisma generate`.

## Known Stubs
- `handleExtract` in DocumentsClient navigates to `/dashboard/documents/${id}/extract` — this route does not exist yet. It will be implemented in Plan 07 (DOC-05). The "Extract to profile" button is only shown for extractable doc types (passport, marriage-certificate, birth-certificate). This is an intentional stub per Plan 07 dependency.

## User Setup Required
None — no external service configuration required beyond Supabase Storage `user-documents` bucket which was already in use.

## Next Phase Readiness
- DocumentsClient exported from `src/app/dashboard/documents/documents-client.tsx` — ready for Plan 07 import
- All DOC-01 through DOC-04 requirements closed
- Plan 07 (DOC-05 AI extraction) can proceed immediately

---
*Phase: 02-core-case-features*
*Completed: 2026-04-17*

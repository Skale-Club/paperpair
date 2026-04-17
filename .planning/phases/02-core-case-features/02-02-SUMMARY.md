---
phase: 02-core-case-features
plan: "02"
subsystem: database
tags: [prisma, postgresql, document-types, typescript]

# Dependency graph
requires: []
provides:
  - Document Prisma model with userProfileId FK, filename, storagePath, docType, mimeType, sizeBytes
  - DOCUMENT_TYPES array (13 entries) with value/label pairs
  - DocumentType union type
  - EXTRACTABLE_DOC_TYPES subset (passport, marriage-certificate, birth-certificate)
  - Migration SQL for Document table
affects: [02-06, 02-07, document-upload, document-list, document-extract]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Document model uses userProfileId FK with onDelete Cascade
    - document-types.ts as canonical source for valid doc type slugs
    - EXTRACTABLE_DOC_TYPES subset for AI extraction feature gating

key-files:
  created:
    - prisma/schema.prisma (Document model added)
    - prisma/migrations/20260417_add_document_model/migration.sql
    - src/lib/document-types.ts
  modified:
    - prisma/schema.prisma (documents Document[] added to UserProfile)

key-decisions:
  - "Migration SQL created manually — no live DB available in worktree; prisma generate run to update Prisma client types"
  - "Document model stores docType as String — validated at application layer via DOCUMENT_TYPES array, not DB enum"

patterns-established:
  - "document-types.ts as canonical source of truth: import DOCUMENT_TYPES for UI dropdowns and Zod validation"
  - "EXTRACTABLE_DOC_TYPES filters which doc types show the Extract to profile button"

requirements-completed: [DOC-02, DOC-03]

# Metrics
duration: 15min
completed: 2026-04-17
---

# Phase 2 Plan 02: Document Model and Type Enum Summary

**Document Prisma model (id, userProfileId FK, filename, storagePath, docType, mimeType, sizeBytes) with 13-entry DOCUMENT_TYPES enum and EXTRACTABLE_DOC_TYPES subset in src/lib/document-types.ts**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-17T16:40:00Z
- **Completed:** 2026-04-17T16:47:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added Document Prisma model with all required fields and UserProfile FK relation
- Created migration SQL for Document table creation and foreign key constraint
- Created src/lib/document-types.ts with 13 document type tags plus extractable subset
- All 23 tests across document-types.test.ts, upload.test.ts, and document-extract.test.ts pass green

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Document model to prisma/schema.prisma** - `02bbecc` (feat)
2. **Task 2: Create src/lib/document-types.ts** - `c40c199` (feat)

**Plan metadata:** (docs commit below)

_Note: Task 2 is a TDD task — tests already existed from Plan 02-01 scaffolding; implementation made them pass GREEN._

## Files Created/Modified
- `prisma/schema.prisma` - Added Document model and documents relation on UserProfile
- `prisma/migrations/20260417_add_document_model/migration.sql` - SQL to create Document table with FK
- `src/lib/document-types.ts` - 13 document type entries, DocumentType union, EXTRACTABLE_DOC_TYPES subset

## Decisions Made
- Migration SQL created manually (no live DB in worktree) — consistent with previous phase pattern
- docType stored as String in Document model, validated at application layer via DOCUMENT_TYPES array (no DB enum needed)

## Deviations from Plan

None - plan executed exactly as written.

Note: Test files (document-types.test.ts, upload.test.ts, document-extract.test.ts) were created by Plan 02-01 on a sibling worktree branch. They were cherry-picked into this worktree as part of Task 1's commit since they were required for the TDD workflow in Task 2.

## Issues Encountered
- Test files from Plan 02-01 were committed on a different worktree branch and not present in this worktree. Resolved by cherry-picking commits from `worktree-agent-abbf358f` before executing.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plans 02-06 and 02-07 can now use `prisma.document.findMany()` and import `DOCUMENT_TYPES` for type validation
- Upload route can be extended with `docType` field validated against `DOCUMENT_TYPES`
- Document list page can query the Document model directly

---
*Phase: 02-core-case-features*
*Completed: 2026-04-17*

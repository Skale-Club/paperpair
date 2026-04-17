---
phase: 02-core-case-features
plan: "03"
subsystem: ui
tags: [form-packs, uscis, instructions, tdd, css-variables, edition-warning]

# Dependency graph
requires:
  - phase: 02-01
    provides: "form-packs.test.ts scaffolds (RED state) for uscisUrl and instructions fields"
provides:
  - FormPackInstructions interface with purpose, whoFills, whatToExpect
  - uscisUrl field on all 6 FormPack entries pointing to uscis.gov
  - editionDate and lockedUntil fields on all 6 FormPack entries
  - Plain-English instructions section rendered in pack detail panel
  - EditionWarningBanner component (amber, role=note) shown when edition is outdated
  - USCIS download link in pack detail panel (target=_blank)
  - Warning CSS custom properties in globals.css
affects: [02-04, 02-05, 02-06, 02-07, 02-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS custom properties for semantic color tokens (warning, destructive)"
    - "TDD RED→GREEN cycle: test file created and failed before implementation"
    - "EditionWarningBanner as standalone function component with inline CSS vars"

key-files:
  created:
    - src/__tests__/lib/form-packs.test.ts
  modified:
    - src/lib/form-packs.ts
    - src/app/dashboard/forms/pack/[id]/page.tsx
    - src/app/globals.css

key-decisions:
  - "Pack detail panel (forms/pack/[id]) is where instructions and USCIS link live — per D-05, D-07"
  - "Edition warning shows for all 6 packs since all lockedUntil dates are before today (2026)"
  - "editionDate and lockedUntil added (Phase 01 backport) since worktree predates Phase 01 execution"

patterns-established:
  - "FormPackInstructions: typed sub-object for pack guidance content"
  - "CSS var pattern for semantic warning colors: --color-warning-bg/border/text"

requirements-completed:
  - FORM-01
  - FORM-02
  - FORM-03
  - FORM-04

# Metrics
duration: 3min
completed: 2026-04-17
---

# Phase 02 Plan 03: Form Pack Instructions & USCIS Links Summary

**FormPack enriched with uscisUrl + FormPackInstructions for all 6 AOS packs; pack detail panel renders plain-English guidance, edition warning banner, and official USCIS download link**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-17T20:49:56Z
- **Completed:** 2026-04-17T20:53:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extended FormPack interface with `uscisUrl: string` and `instructions: FormPackInstructions` (+ Phase 01 backport of `editionDate`/`lockedUntil`)
- Populated all 6 packs with USCIS form page URLs and plain-English instructions (purpose, whoFills, whatToExpect)
- Pack detail page at `/dashboard/forms/pack/[id]` now renders instructions section, conditional edition warning banner, and USCIS download link
- Added 4 warning CSS custom properties to globals.css: `--color-warning-bg`, `--color-warning-border`, `--color-warning-text`, `--color-destructive`
- Created form-packs.test.ts with TDD RED→GREEN cycle; 10 tests pass green

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend FormPack type and populate data** - `c41ee23` (feat)
2. **Task 2: Add warning CSS variables and enrich pack detail panel** - `3d15038` (feat)

**Plan metadata:** (final docs commit, see below)

_Note: Task 1 followed TDD pattern — test file created in RED state first, then implementation made tests pass GREEN._

## Files Created/Modified
- `src/lib/form-packs.ts` - Added FormPackInstructions interface, uscisUrl/instructions fields, editionDate/lockedUntil; populated all 6 packs
- `src/__tests__/lib/form-packs.test.ts` - 10 tests covering edition locks (BUG-09), uscisUrl (FORM-04), and instructions (FORM-02)
- `src/app/dashboard/forms/pack/[id]/page.tsx` - Added EditionWarningBanner component, instructions section, edition warning conditional, USCIS download link
- `src/app/globals.css` - Added 4 warning CSS custom properties

## Decisions Made
- Pack detail panel at `/dashboard/forms/pack/[id]/page.tsx` is the correct location per D-05 (not `my-forms/page.tsx` which lacks a pack panel)
- `editionDate` and `lockedUntil` backported from Phase 01 since this worktree predates those changes
- All 6 packs will show the edition warning banner in production since all `lockedUntil` dates precede current date (2026)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added editionDate and lockedUntil fields missing from worktree**
- **Found during:** Task 1 (FormPack type extension)
- **Issue:** Plan interface spec included `editionDate` and `lockedUntil` as existing fields, but the worktree's form-packs.ts predates Phase 01 execution and lacked them. The form-packs.test.ts scaffold (from Phase 01) asserts both fields exist.
- **Fix:** Added editionDate and lockedUntil to the FormPack interface and all 6 pack objects (matching Phase 01 values from main repo)
- **Files modified:** src/lib/form-packs.ts
- **Verification:** All 10 form-packs.test.ts tests pass including the BUG-09 edition locks suite
- **Committed in:** c41ee23 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug/missing field)
**Impact on plan:** Required to satisfy the test contract from Phase 01. No scope creep.

## Issues Encountered
- Pre-existing TypeScript error in `src/__tests__/lib/fee-schedule.test.ts` (FEES_2026 export missing from fee-schedule.ts) — out of scope, logged as pre-existing, not introduced by this plan.

## Known Stubs
None — all 6 FormPacks have uscisUrl and instructions fully populated.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FORM-01 through FORM-04 requirements satisfied
- Pack detail page now shows instructions and USCIS links for all 6 AOS form packs
- Warning CSS variables available for use in other components requiring amber/error styling

---
*Phase: 02-core-case-features*
*Completed: 2026-04-17*

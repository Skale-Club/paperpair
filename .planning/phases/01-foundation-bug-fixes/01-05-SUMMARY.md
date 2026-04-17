---
phase: 01-foundation-bug-fixes
plan: 05
subsystem: timeline
tags: [fees, timeline, fee-schedule, bug-fix, tdd]

# Dependency graph
requires:
  - phase: 01-foundation-bug-fixes
    plan: 03
    provides: "FEES_2026 barrel export and named constants in fee-schedule.ts"
provides:
  - "timeline-checklists.ts fee labels sourced from fee-schedule constants"
  - "my-case-timeline.tsx filing fee note sourced from fee-schedule constants"
affects:
  - "src/lib/timeline-checklists.ts"
  - "src/components/my-case-timeline.tsx"

# Tech stack
tech_stack:
  added: []
  patterns:
    - "Template literal interpolation of fee constants into UI label strings"
    - "Module-scope constant for standalone fee not in fee-schedule (FEES_2026_I131_STANDALONE)"

# Key files
key_files:
  created:
    - src/__tests__/lib/timeline-checklists-fees.test.ts
    - src/__tests__/components/my-case-timeline-fees.test.tsx
  modified:
    - src/lib/timeline-checklists.ts
    - src/components/my-case-timeline.tsx

# Decisions
decisions:
  - "FEES_2026_I131_STANDALONE = 630 defined at module scope in my-case-timeline.tsx — standalone I-131 fee is not in fee-schedule.ts (which only tracks the with-I-485 bundled fee of $0)"

# Metrics
metrics:
  duration_minutes: 8
  completed_date: "2026-04-17"
  tasks_completed: 2
  files_changed: 4
---

# Phase 01 Plan 05: Fee Hardcode Removal Summary

**One-liner:** Replaced $675 hardcoded I-130 fee and $260 I-765 fee strings in both timeline files with named imports from fee-schedule.ts, enforced by 6 TDD tests.

## Objective

BUG-06 required a single source of truth for USCIS fees. Plan 03 added the FEES_2026 constants to fee-schedule.ts but left the two timeline files with stale hardcoded amounts. This plan wired both files to the canonical constants.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Replace hardcoded fees in timeline-checklists.ts | 5c3969e | src/lib/timeline-checklists.ts, src/__tests__/lib/timeline-checklists-fees.test.ts |
| 2 | Replace hardcoded fee note in my-case-timeline.tsx | 2a65966 | src/components/my-case-timeline.tsx, src/__tests__/components/my-case-timeline-fees.test.tsx |

## Changes Made

### timeline-checklists.ts
- Added `import { FEES_2026_I130_PAPER, FEES_2026_I765_EAD_INITIAL } from "@/lib/fee-schedule"` at top of file
- `i130-9` label: replaced literal `$675` with template literal interpolating `FEES_2026_I130_PAPER` (535)
- `i765-6` label: replaced literal `$260` with template literal interpolating `FEES_2026_I765_EAD_INITIAL` (260)

### my-case-timeline.tsx
- Added import of `FEES_2026_I130_PAPER`, `FEES_2026_I485`, `FEES_2026_I765_EAD_INITIAL` from `@/lib/fee-schedule`
- Defined `const FEES_2026_I131_STANDALONE = 630` at module scope (standalone I-131 is not tracked in fee-schedule.ts)
- Filing fee note at pos 3: `"Separate checks for each form (I-130: $675, ...)"` replaced with template literal using all four constants

## Test Results

- 3 new tests: `timeline-checklists-fees.test.ts` — all pass (i130-9 shows $535, i765-6 shows $260, no $675 in any label)
- 3 new tests: `my-case-timeline-fees.test.tsx` — all pass (fee constant value assertions)
- Full suite: 60/60 tests pass (up from 54 pre-plan)

## Verification

```
grep -rn '$675' src/lib/timeline-checklists.ts src/components/my-case-timeline.tsx
# → (no output — zero hardcoded $675 instances)

grep -n "fee-schedule" src/lib/timeline-checklists.ts src/components/my-case-timeline.tsx
# → both files show fee-schedule import
```

## Deviations from Plan

None — plan executed exactly as written. The `FEES_2026_I131_STANDALONE` constant was defined as specified by the plan (plan instruction step 2.a explicitly called for it).

## Known Stubs

None. All fee values are wired to real constants. No placeholder data.

## Self-Check: PASSED

- src/__tests__/lib/timeline-checklists-fees.test.ts — FOUND
- src/__tests__/components/my-case-timeline-fees.test.tsx — FOUND
- Commit 5c3969e — FOUND
- Commit 2a65966 — FOUND

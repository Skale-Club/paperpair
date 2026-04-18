---
phase: 02
plan: "04"
subsystem: screener-case-setup
tags: [screener, timeline, case-status, ewi, receipt-numbers]
dependency_graph:
  requires: []
  provides:
    - filterTimelineByEntryType (src/lib/timeline-checklists.ts)
    - EwiWarning component (src/components/initial-screener.tsx)
    - immigration-info step page with CASE-03 fields
  affects:
    - src/app/dashboard/page.tsx (EwiWarning conditionally rendered)
    - src/lib/timeline-checklists.ts (new exports)
    - src/components/initial-screener.tsx (EwiWarning + button label)
tech_stack:
  added: []
  patterns:
    - Server Component outer page + Client Component form pattern
    - TDD (RED → GREEN) for filterTimelineByEntryType
    - Merge-before-save pattern to preserve screener answers in immigration-info CaseStep
key_files:
  created:
    - src/__tests__/lib/timeline-filter.test.ts
    - src/__tests__/lib/screener.test.ts
    - src/app/dashboard/immigration-info/page.tsx
    - src/app/dashboard/immigration-info/immigration-info-client.tsx
  modified:
    - src/lib/timeline-checklists.ts
    - src/components/initial-screener.tsx
    - src/app/dashboard/page.tsx
decisions:
  - "filterTimelineByEntryType lives in timeline-checklists.ts alongside SECTION_CHECKLISTS (D-03)"
  - "EwiWarning uses CSS variable fallbacks for warning colors to not depend on missing CSS vars"
  - "immigration-info client form merges existingData before PATCH to avoid overwriting screener answers (D-04)"
  - "PATCH method used (not POST) for steps API — already implemented and working"
metrics:
  duration_minutes: 10
  completed_date: "2026-04-17"
  tasks_completed: 3
  files_changed: 7
---

# Phase 2 Plan 4: Screener Wiring + EWI Warning + Case Status Summary

**One-liner:** Timeline entry-type filtering via `filterTimelineByEntryType`, EWI inline warning exported from screener and rendered on dashboard, and immigration-info step page with receipt number/priority date/case status fields (CASE-01 through CASE-04).

---

## What Was Built

### Task 1: filterTimelineByEntryType (TDD)
Added `TypelineSection` type, `TIMELINE_SECTIONS` ordered array, and `filterTimelineByEntryType` function to `src/lib/timeline-checklists.ts`. EWI/overstay users get an `ewi-consult` section prepended (attorney consultation); lawful-entry users see the standard 19-section list. 10 tests written (RED then GREEN).

### Task 2: EwiWarning + screener button label
Exported `EwiWarning` component from `src/components/initial-screener.tsx`. Changed final screener step button label from "Finish Setup →" to "Continue to my case". Dashboard `page.tsx` now imports and conditionally renders `EwiWarning` for EWI users after screener is dismissed.

Key finding: the screener already had save-on-complete logic using PATCH `/api/dashboard/steps` with the `immigration-info` slug. No changes needed to the save logic — it was already wired correctly from a prior plan.

### Task 3: Immigration Info Step Page (CASE-03)
Created `src/app/dashboard/immigration-info/page.tsx` (Server Component) that pre-fills from existing `immigration-info` CaseStep, and `immigration-info-client.tsx` (Client Component) with fields:
- `receiptNumber` — I-485 receipt number
- `i130ReceiptNumber` — I-130 receipt number
- `priorityDate` — priority date (text, MM/DD/YYYY)
- `caseStatus` — select (biometrics-pending, interview-scheduled, approved, rfe-received, other)

Save merges with `existingData` prop before PATCH to preserve screener answers (fullName, entryType, etc.).

---

## Deviations from Plan

### Auto-fixed Issues

None — plan executed essentially as written.

**Minor adaptations (within spec):**
- Task 2: The screener already used `saving` state (not `isSaving`). The plan described adding `isSaving` state, but since `saving` was already present with identical behavior, no rename was needed. The plan's done criteria (button shows "Saving…" while saving, disabled state) are met.
- Task 2: `EwiWarning` uses inline CSS variable fallbacks (`var(--color-warning-bg, #fffbeb)`) since those CSS variables may not be defined in globals.css. This ensures the warning renders correctly regardless.
- Task 3: The API route uses PATCH (not POST as the plan template suggested) — this is the existing route convention already in use by the screener.

---

## Known Stubs

None — all fields flow to the DB and pre-fill from server-side data on page load.

---

## Self-Check: PASSED

All 7 files confirmed present. All 3 task commits confirmed in git log (1c2ef4a, 5c41f85, 848e906).

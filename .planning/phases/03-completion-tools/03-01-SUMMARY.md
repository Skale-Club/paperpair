---
phase: 03-completion-tools
plan: 01
subsystem: ui
tags: [poverty-guidelines, income-calculator, i-864, dashboard, sidebar, translations]

requires:
  - phase: 02-core-case-features
    provides: CaseStep model and PATCH /api/dashboard/steps endpoint for saving step data

provides:
  - src/lib/poverty-guidelines.ts with POVERTY_GUIDELINES_2026, get125PercentThreshold()
  - src/app/dashboard/income-calculator/ page + client widget
  - income-calculator slug in DASHBOARD_STEPS (isDashboardStepSlug accepts it)
  - sidebar.incomeCalculator and sidebar.submission translation keys
  - Income Calculator and Ready to Submit sidebar nav items

affects: [03-02-submission, any plan using DASHBOARD_STEPS or sidebar nav]

tech-stack:
  added: []
  patterns:
    - "Poverty guidelines module follows fee-schedule.ts pattern: individual named constants + barrel export object"
    - "Server Component reads CaseStep via Prisma, passes existingData via asStepData() to client"
    - "Client widget saves on calculate action via PATCH /api/dashboard/steps"

key-files:
  created:
    - src/lib/poverty-guidelines.ts
    - src/app/dashboard/income-calculator/page.tsx
    - src/app/dashboard/income-calculator/income-calculator-client.tsx
    - src/__tests__/lib/dashboard-steps.test.ts
    - src/__tests__/lib/poverty-guidelines.test.ts
  modified:
    - src/lib/dashboard-steps.ts
    - src/lib/translations.ts
    - src/components/dashboard-sidebar.tsx

key-decisions:
  - "income-calculator page placed outside (panel) route group to avoid Immigration Timeline heading"
  - "get125PercentThreshold uses Math.round to match HHS ASPE verified dollar values"

patterns-established:
  - "Poverty guideline constants follow fee-schedule pattern: named exports + barrel object"
  - "Calculator pages use Server Component for initial data load + Client Component for interactions"

requirements-completed: ["CALC-01", "CALC-02", "CALC-03", "CALC-04"]

duration: 3min
completed: 2026-04-17
---

# Phase 03 Plan 01: Income Calculator Summary

**I-864 income eligibility check: household-size selector, 125% FPG threshold via HHS 2026 data, pass/fail result with joint sponsor explanation, saved to CaseStep with sidebar nav entry**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-17T22:26:20Z
- **Completed:** 2026-04-17T22:29:05Z
- **Tasks:** 3
- **Files modified:** 8 (5 created, 3 modified)

## Accomplishments

- Created `src/lib/poverty-guidelines.ts` with 2026 HHS FPG data and `get125PercentThreshold()` for all 8 household sizes
- Built `/dashboard/income-calculator` with Server Component pre-fill from CaseStep and Client widget that saves results via PATCH API
- Added Income Calculator and Submission sidebar nav items with translations in both English and pt-BR

## Task Commits

1. **Task 1: income-calculator slug + poverty-guidelines + tests** - `da26f57` (feat + test, TDD)
2. **Task 2: Server Component page + Client Component widget** - `198597b` (feat)
3. **Task 3: translations + sidebar nav items** - `5f16289` (feat)

## Files Created/Modified

- `src/lib/poverty-guidelines.ts` — POVERTY_2026_BASE, POVERTY_2026_PER_ADDITIONAL_PERSON, POVERTY_GUIDELINES_2026, get125PercentThreshold()
- `src/lib/dashboard-steps.ts` — Added income-calculator entry (order 7, critical: false)
- `src/app/dashboard/income-calculator/page.tsx` — Server Component; reads CaseStep, passes existingData to client
- `src/app/dashboard/income-calculator/income-calculator-client.tsx` — Household size selector, income input, Calculate button, result card with joint sponsor explanation
- `src/__tests__/lib/dashboard-steps.test.ts` — isDashboardStepSlug unit tests
- `src/__tests__/lib/poverty-guidelines.test.ts` — All 8 threshold value tests + POVERTY_GUIDELINES_2026 shape tests
- `src/lib/translations.ts` — sidebar.incomeCalculator and sidebar.submission keys (en + pt-BR)
- `src/components/dashboard-sidebar.tsx` — /dashboard/income-calculator and /dashboard/submission MENU_ITEMS

## Decisions Made

- Income calculator page placed directly under `src/app/dashboard/income-calculator/` (not under `(panel)`) to avoid the Immigration Timeline heading from the panel route group layout
- `get125PercentThreshold()` uses `Math.round()` to produce exact HHS ASPE published dollar amounts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing `fee-schedule.test.ts` failures (6 tests) were present before this plan and are out of scope. All 13 new tests from this plan pass.

## Known Stubs

None — income calculator is fully wired: data flows from CaseStep DB → page.tsx → IncomeCalculatorClient, and saves back via PATCH /api/dashboard/steps.

## Next Phase Readiness

- `income-calculator` slug accepted by `isDashboardStepSlug()` — PATCH endpoint will accept saves without 400 error
- `sidebar.submission` nav item points to `/dashboard/submission` — ready for Plan 03-02 to wire the submission page
- All CALC-01 through CALC-04 requirements satisfied

---
*Phase: 03-completion-tools*
*Completed: 2026-04-17*

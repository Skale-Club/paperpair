# Phase 3: Completion Tools — Validation Architecture

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.1 |
| Config file | `vitest.config.ts` |
| Quick run | `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts` |
| Full suite | `npx vitest run` |

## Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| CALC-02 | `get125PercentThreshold(n)` returns correct amounts for household sizes 1–8 | unit | `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts` |
| CALC-02 | `POVERTY_GUIDELINES_2026.baseAmount` = 15960, `perAdditionalPerson` = 5680 | unit | `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts` |
| CALC-03 | `isDashboardStepSlug("income-calculator")` returns true | unit | `npx vitest run src/__tests__/lib/dashboard-steps.test.ts` |
| SUB-01 | `FORM_PACKS` has `uscisUrl` + `pdfUrl` for all 6 packs | unit | `npx vitest run src/__tests__/lib/form-packs.test.ts` |
| CALC-01, CALC-04, SUB-02, SUB-03, SUB-04 | UI interaction, save flow, link nav | manual | N/A — auth-gated, manual browser test |

## Sampling Rate

- **Per task:** `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

## Wave 0 Gaps

- [ ] `src/__tests__/lib/poverty-guidelines.test.ts` — CALC-02 threshold math + data shape
- [ ] `src/__tests__/lib/dashboard-steps.test.ts` — CALC-03 slug validation (may already exist from Phase 1)

*(Existing `src/__tests__/lib/form-packs.test.ts` covers SUB-01 partially — verify it checks `uscisUrl` fields)*

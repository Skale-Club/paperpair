# Phase 4: Interview Prep — Validation Architecture

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.1 |
| Config file | `vitest.config.ts` |
| Quick run | `npx vitest run src/__tests__/lib/interview-questions.test.ts` |
| Full suite | `npx vitest run` |

## Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| INT-01 | Question bank has 28–32 questions with correct field shape | unit | `npx vitest run src/__tests__/lib/interview-questions.test.ts` |
| INT-01 | All 4 categories represented with ≥5 questions each | unit | `npx vitest run src/__tests__/lib/interview-questions.test.ts` |
| INT-02 | Categories filter correctly — correct questions per category | unit | `npx vitest run src/__tests__/lib/interview-questions.test.ts` |
| INT-03 | Checklist starts unchecked; confirmation appears when all checked | unit (component) | `npx vitest run src/__tests__/components/interview-checklist.test.tsx` |
| INT-04 | InterviewClient accepts userRole prop; tips section renders petitioner + beneficiary sub-sections | static (type-check) | `npx tsc --noEmit` |

## Sampling Rate

- **Per task:** `npx vitest run src/__tests__/lib/interview-questions.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

## Wave 0 Gaps

- [ ] `src/__tests__/lib/interview-questions.test.ts` — covers INT-01 and INT-02 data shape
- [ ] `src/__tests__/components/interview-checklist.test.tsx` — covers INT-03 interaction

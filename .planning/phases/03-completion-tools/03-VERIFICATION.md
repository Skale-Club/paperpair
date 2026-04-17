---
phase: 03-completion-tools
verified: 2026-04-17T19:45:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Income Calculator — full save/reload cycle"
    expected: "Select household size 4, enter $30,000, click Calculate → red 'Income Does Not Qualify' banner with threshold $41,250, joint sponsor section visible with https://www.uscis.gov/i-864 link. Navigate away and back — form pre-fills with saved values."
    why_human: "CaseStep pre-fill requires an authenticated Supabase session and a live Prisma write; cannot simulate without running the dev server."
  - test: "Submission page — AP warning banner is visible first on page load"
    expected: "Amber banner with warning icon appears before the form download list, before the checklist, and before the lockbox section."
    why_human: "Section ordering depends on DOM render; cannot verify without a browser."
  - test: "Sidebar nav — Income Calculator and Ready to Submit highlight correctly"
    expected: "Navigating to /dashboard/income-calculator highlights 'Income Calculator'; navigating to /dashboard/submission highlights 'Ready to Submit'. Both items appear in the sidebar."
    why_human: "isActive logic depends on the live pathname hook; needs a browser session."
---

# Phase 3: Completion Tools Verification Report

**Phase Goal:** Deliver two completion-oriented capabilities — I-864 Income Calculator and Submission Packet page.
**Verified:** 2026-04-17T19:45:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can enter household size and annual income, click Calculate, and see the 125% threshold and a pass/fail result | VERIFIED | `income-calculator-client.tsx` has household size select (1-8), annual income text input, Calculate button invoking `handleCalculate()`, result card with threshold and qualified/not-qualified display |
| 2 | Insufficient income shows a joint sponsor explanation with a link to https://www.uscis.gov/i-864 | VERIFIED | Lines 174-203 of `income-calculator-client.tsx` conditionally render "Joint Sponsor Required" block with `href="https://www.uscis.gov/i-864"` |
| 3 | Calculation result is saved to CaseStep (stepSlug=income-calculator) on each calculate action | VERIFIED | `handleCalculate()` PATCH-es `/api/dashboard/steps` with `stepSlug: "income-calculator"` and `isDashboardStepSlug("income-calculator")` returns true (confirmed by test) |
| 4 | Revisiting the page pre-fills previously saved household size and income | VERIFIED | `page.tsx` reads `prisma.caseStep.findUnique` for `stepSlug: "income-calculator"` and calls `asStepData(step?.data)` before passing `existingData` prop to client; client initializes `useState` from `existingData` fields |
| 5 | Income Calculator appears in the dashboard sidebar and navigates to /dashboard/income-calculator | VERIFIED | `dashboard-sidebar.tsx` MENU_ITEMS has `href: "/dashboard/income-calculator"` with `labelKey: "sidebar.incomeCalculator"` — translations.ts has the key in both `en` ("Income Calculator") and `pt-BR` ("Calculadora de Renda") |
| 6 | User sees a list of all 6 AOS form packs with a Download PDF link and a USCIS.gov link per pack | VERIFIED | `submission-client.tsx` maps over `formPacks` prop rendering `pack.coverPdfUrl` (download attr) and `pack.uscisUrl` (USCIS.gov link); `submission/page.tsx` serializes all 6 FORM_PACKS entries (i130, i131, i485, i693, i765, i864a) |
| 7 | User sees a prominent amber AP travel warning banner above the checklist | VERIFIED | `submission-client.tsx` renders the warning `<div role="alert">` as the first child (lines 42-74), before the form download section and checklist; uses `--color-warning-bg/border/text` CSS vars matching D-11 text verbatim |
| 8 | User sees a USCIS lockbox section linking to https://www.uscis.gov/i-485 (never a hardcoded address) | VERIFIED | Lines 144-175 render lockbox section with `<a href="https://www.uscis.gov/i-485" target="_blank" rel="noopener noreferrer">`; no street address or zip code string present anywhere in the file |
| 9 | Ready to Submit page is reachable via the sidebar nav added in Plan 03-01 | VERIFIED | `dashboard-sidebar.tsx` MENU_ITEMS has `href: "/dashboard/submission"` with `labelKey: "sidebar.submission"`, positioned after income-calculator and before support |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/poverty-guidelines.ts` | POVERTY_GUIDELINES_2026, POVERTY_2026_BASE, POVERTY_2026_PER_ADDITIONAL_PERSON, get125PercentThreshold() | VERIFIED | All 4 exports present; baseAmount=15960, perAdditionalPerson=5680; formula matches HHS ASPE 2026 values |
| `src/lib/dashboard-steps.ts` | income-calculator slug in DASHBOARD_STEPS | VERIFIED | Entry at order:7 with slug "income-calculator" added; isDashboardStepSlug("income-calculator") returns true |
| `src/app/dashboard/income-calculator/page.tsx` | Server Component; reads CaseStep; passes existingData | VERIFIED | `export const dynamic = "force-dynamic"`, auth guard, Prisma read, asStepData call, existingData prop |
| `src/app/dashboard/income-calculator/income-calculator-client.tsx` | Client widget: size selector, income input, calculate, result display | VERIFIED | "use client", useState for all fields, PATCH to /api/dashboard/steps, result card with conditional joint sponsor section |
| `src/app/dashboard/submission/page.tsx` | Server Component; imports FORM_PACKS; renders SubmissionClient | VERIFIED | `export const dynamic = "force-dynamic"`, auth guard, FORM_PACKS serialized to strip Date fields, SubmissionClient rendered |
| `src/app/dashboard/submission/submission-client.tsx` | AP warning banner, form download list, assembly checklist, lockbox link | VERIFIED | All 4 SUB sections present in correct order (warning → forms → checklist → lockbox) |
| `src/__tests__/lib/poverty-guidelines.test.ts` | Unit tests for threshold calculations | VERIFIED | 2 describe blocks, 10 tests, all 8 household-size thresholds covered |
| `src/__tests__/lib/dashboard-steps.test.ts` | isDashboardStepSlug("income-calculator") returns true | VERIFIED | 3 tests covering accept, reject, and regression cases |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `income-calculator/page.tsx` | `income-calculator-client.tsx` | `existingData` prop from `asStepData(step?.data)` | WIRED | `asStepData` called on line 22; passed as `existingData` to `IncomeCalculatorClient` on line 31 |
| `income-calculator-client.tsx` | `/api/dashboard/steps` | PATCH fetch on Calculate button | WIRED | `fetch("/api/dashboard/steps", { method: "PATCH" })` in `handleCalculate()` with `stepSlug: "income-calculator"` |
| `/api/dashboard/steps` | `isDashboardStepSlug` | stepSlug validation | WIRED | `isDashboardStepSlug("income-calculator")` returns true (test-confirmed); API will accept the slug |
| `submission/page.tsx` | `submission-client.tsx` | FORM_PACKS as prop | WIRED | `serializedPacks` derived from FORM_PACKS passed as `formPacks` prop to `SubmissionClient` |
| `submission-client.tsx` | `https://www.uscis.gov/i-485` | external anchor tag | WIRED | `<a href="https://www.uscis.gov/i-485" target="_blank" rel="noopener noreferrer">` on line 152 |
| `submission-client.tsx` | `formPacks[n].coverPdfUrl` and `formPacks[n].uscisUrl` | map over formPacks | WIRED | Both `pack.coverPdfUrl` (download link) and `pack.uscisUrl` (USCIS.gov link) rendered per pack in the map |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `income-calculator-client.tsx` | `existingData` (pre-fill) | `prisma.caseStep.findUnique` in `page.tsx` | Yes — DB query for authenticated user's step | FLOWING |
| `income-calculator-client.tsx` | `result` (calculation output) | `get125PercentThreshold(householdSize)` + user-entered income | Yes — computed from real user input | FLOWING |
| `submission-client.tsx` | `formPacks` | `FORM_PACKS` static array from `src/lib/form-packs.ts` | Yes — 6 real form pack entries with USCIS URLs and PDF paths | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `get125PercentThreshold(2)` returns 27050 | vitest test suite | 13/13 poverty-guidelines + dashboard-steps tests pass | PASS |
| `isDashboardStepSlug("income-calculator")` returns true | vitest test suite | Test passes | PASS |
| All 118 tests pass | `npx vitest run` | 23 test files, 118 tests, 0 failures | PASS |
| TypeScript compiles clean | `npx tsc --noEmit` | No output (clean) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CALC-01 | 03-01 | User enters household size and petitioner's annual income | SATISFIED | Household size select (1-8) + annual income text input in `income-calculator-client.tsx` |
| CALC-02 | 03-01 | Calculator displays 125% FPG threshold for that household size | SATISFIED | `get125PercentThreshold(householdSize)` called in `handleCalculate()`; threshold displayed in result card |
| CALC-03 | 03-01 | Calculator tells user if income qualifies or if a joint sponsor is needed | SATISFIED | `qualified = incomeNum >= threshold` drives "Income Qualifies" vs "Income Does Not Qualify" display; result saved to CaseStep |
| CALC-04 | 03-01 | Calculator explains joint sponsor requirements if income is insufficient | SATISFIED | Conditional block (lines 174-203) explains independent threshold requirement for joint sponsor's own household, links to https://www.uscis.gov/i-864 |
| SUB-01 | 03-02 | User can download their filled PDF forms as a complete package | SATISFIED | All 6 FORM_PACKS rendered with `download` attribute on `coverPdfUrl` links |
| SUB-02 | 03-02 | Submission checklist guides user through packet assembly and mailing | SATISFIED | 7-item `CHECKLIST_ITEMS` array with interactive checkboxes; "packet ready" confirmation when all checked |
| SUB-03 | 03-02 | Correct USCIS lockbox address displayed (never hardcoded — links to USCIS.gov) | SATISFIED | Links to `https://www.uscis.gov/i-485` only; explicit text tells user addresses change; no street address present |
| SUB-04 | 03-02 | Advance Parole travel warning shown prominently before submission | SATISFIED | Amber banner with `role="alert"` is the first rendered element; text matches D-11 verbatim |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `income-calculator-client.tsx` | 124 | `placeholder="0"` | Info | HTML input placeholder attribute for hint text — not a stub; the field is functional |

No blockers or warnings found. The single info item is an HTML input hint attribute, not a code stub.

### Human Verification Required

#### 1. Income Calculator — Save and Reload Cycle

**Test:** Log in, navigate to `/dashboard/income-calculator`. Select household size 4, enter $30,000, click Calculate. Then navigate away to `/dashboard` and back to `/dashboard/income-calculator`.
**Expected:** On return, household size shows 4, income shows 30000, result card shows "Income Does Not Qualify" with threshold $41,250, joint sponsor section visible, https://www.uscis.gov/i-864 link present.
**Why human:** CaseStep persistence requires an authenticated Supabase session and a running Prisma/Postgres instance.

#### 2. Income Calculator — Qualified Result

**Test:** On the income calculator, select household size 2, enter $28,000, click Calculate.
**Expected:** Green "Income Qualifies" banner, threshold shown as $27,050, no joint sponsor section visible.
**Why human:** Requires browser + auth session.

#### 3. Submission Page — Visual Section Order

**Test:** Navigate to `/dashboard/submission`.
**Expected:** Amber AP travel warning banner (with triangle icon) is the first visible content block, above the "Download Your Forms" section, above the checklist, and above the lockbox section.
**Why human:** DOM ordering in a React Server Component page requires a browser render.

#### 4. Sidebar Navigation Highlighting

**Test:** Navigate to `/dashboard/income-calculator` and `/dashboard/submission`.
**Expected:** The corresponding sidebar item highlights for each page. Both "Income Calculator" and "Ready to Submit" items are visible in the sidebar.
**Why human:** `isActive` uses `usePathname()` hook; requires live browser routing.

### Gaps Summary

No gaps. All 9 observable truths verified, all 8 artifacts confirmed substantive and wired, all 8 requirements satisfied, TypeScript compiles clean, 118/118 tests pass.

---

_Verified: 2026-04-17T19:45:00Z_
_Verifier: Claude (gsd-verifier)_

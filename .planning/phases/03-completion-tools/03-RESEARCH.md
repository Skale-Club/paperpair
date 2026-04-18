# Phase 3: Completion Tools - Research

**Researched:** 2026-04-17
**Domain:** Next.js 15 App Router dashboard features — client-side calculator with CaseStep persistence, static submission checklist page
**Confidence:** HIGH

## Summary

Phase 3 delivers two self-contained dashboard pages: an I-864 income calculator at `/dashboard/income-calculator` and a submission packet page at `/dashboard/submission`. Both pages follow patterns already established in the codebase. All patterns (Server Component shell, CaseStep upsert, amber warning banner) are fully implemented and ready to reuse.

The income calculator has one critical API-layer constraint: the existing `/api/dashboard/steps` PATCH handler validates `stepSlug` against `isDashboardStepSlug()`, which checks the `DASHBOARD_STEPS` constant. The slug `"income-calculator"` is NOT in that constant. The planner must include a task to add it — otherwise the save call will return 400.

The 2026 HHS Federal Poverty Guidelines for the 48 contiguous states are confirmed: base $15,960 (household of 1) + $5,680 per additional person. Published in the Federal Register January 2026.

**Primary recommendation:** Follow `fee-schedule.ts` exactly for `poverty-guidelines.ts`, add `"income-calculator"` to `DASHBOARD_STEPS`, and reuse `EwiWarning` as the template for the AP travel warning banner.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Income Calculator (CALC-01, CALC-02, CALC-03, CALC-04)
- **D-01:** Calculator lives at `/dashboard/income-calculator` — a standalone Server Component page with a client-side calculator widget.
- **D-02:** Poverty guidelines hardcoded in `src/lib/poverty-guidelines.ts` with comment: `// HHS 2026 Federal Poverty Guidelines — update annually (published Jan/Feb each year)`. No external fetch.
- **D-03:** Data shape: `POVERTY_GUIDELINES_2026 = { baseAmount: number, perAdditionalPerson: number }` — threshold = baseAmount + (householdSize - 1) × perAdditionalPerson. The 125% threshold is `threshold × 1.25`.
- **D-04:** Calculator result (qualified: boolean, threshold: number, householdSize: number, annualIncome: number) saved to `CaseStep.data` under `stepSlug = "income-calculator"` on each calculation. Pre-fills fields on revisit.
- **D-05:** Insufficient income UI shows joint sponsor explanation + link to USCIS I-864 instructions.
- **D-06:** Calculator is purely client-side — no new API route. Save goes through existing `/api/dashboard/steps`.

#### Submission Page (SUB-01, SUB-02, SUB-03, SUB-04)
- **D-07:** Submission lives at `/dashboard/submission` — a new Server Component page.
- **D-08:** Form downloads are individual links per form pack — not a ZIP. Links to existing form PDFs or USCIS download page.
- **D-09:** Submission checklist is a static interactive checklist — checkbox state in component state only, not persisted to DB.
- **D-10:** USCIS lockbox links to `https://www.uscis.gov/i-485`. Never hardcode an address string.
- **D-11:** AP travel warning is a prominent static banner using `--color-warning-*` CSS variables. Text: "Do not travel outside the U.S. while your I-485 is pending without an approved Advance Parole document (Form I-131). Leaving without AP will typically abandon your application."

### Claude's Discretion
- Exact poverty guidelines numbers for 2026 (researcher to verify from HHS source) — **resolved below**
- Calculator widget layout (inline form vs card, result display style)
- Submission page section order (form list vs checklist vs address vs warning)
- Whether to add a navigation link to `/dashboard/submission` in the sidebar (and where)
- Whether to add a navigation link to `/dashboard/income-calculator` in the sidebar

### Deferred Ideas (OUT OF SCOPE)
- ZIP download of all filled PDFs — deferred to Phase 4+
- Persisting checklist state to CaseStep — deferred; component state sufficient for v1
- State-based USCIS lockbox routing — deferred; link to USCIS.gov locator is sufficient
- Navigation sidebar updates — Claude's discretion in planning
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALC-01 | Petitioner household income input with household size selector | CaseStep pre-fill pattern (immigration-info-client.tsx), client component with useState |
| CALC-02 | 125% FPG threshold calculation and pass/fail display | poverty-guidelines.ts data, formula: (baseAmount + (size-1) * perPerson) * 1.25 |
| CALC-03 | Result saved to CaseStep stepSlug="income-calculator" | `/api/dashboard/steps` PATCH — but requires adding slug to DASHBOARD_STEPS first |
| CALC-04 | Joint sponsor explanation when income is insufficient | Static UI section, link to https://www.uscis.gov/i-864 |
| SUB-01 | Form download list — one link per form pack | FORM_PACKS array from form-packs.ts: uscisUrl + pdfUrl fields available |
| SUB-02 | Packet assembly checklist — interactive client-side checkboxes | useState array, no persistence needed |
| SUB-03 | USCIS lockbox link to https://www.uscis.gov/i-485 | Static anchor tag, external link pattern |
| SUB-04 | AP travel warning banner above checklist | EwiWarning component pattern from initial-screener.tsx |
</phase_requirements>

---

## Standard Stack

### Core — No new dependencies required

All Phase 3 work uses libraries already installed in the project.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^15.5.14 | Server Component pages + routing | Project stack |
| React | 19.2.4 | Client component interactivity (useState) | Project stack |
| Tailwind CSS | ^3.4.17 | All styling | Project stack |
| Prisma / @prisma/client | ^6.4.1 | CaseStep read in Server Component | Project stack |
| Zod | ^4.3.6 | Already used in the steps API route (no new usage needed) | Project stack |

**No new npm packages needed for this phase.** All functionality is achievable with what is installed.

---

## Architecture Patterns

### Recommended Project Structure — New files only

```
src/
├── lib/
│   └── poverty-guidelines.ts       # New: HHS 2026 FPG constants
├── app/dashboard/
│   ├── income-calculator/
│   │   ├── page.tsx                # New: Server Component shell
│   │   └── income-calculator-client.tsx  # New: Client Component widget
│   └── submission/
│       ├── page.tsx                # New: Server Component shell
│       └── submission-client.tsx   # New: Client Component for checklist
└── __tests__/lib/
    └── poverty-guidelines.test.ts  # New: unit tests for threshold calculation
```

### Pattern 1: Hardcoded Financial Data Module (`poverty-guidelines.ts`)

Follow `fee-schedule.ts` exactly. Named exports + barrel object + JSDoc with source, year, and update instructions.

```typescript
// src/lib/poverty-guidelines.ts
/**
 * 2026 HHS Federal Poverty Guidelines (48 contiguous states + D.C.)
 * Source: HHS/ASPE Federal Register, January 2026
 * https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 * // HHS 2026 Federal Poverty Guidelines — update annually (published Jan/Feb each year)
 * @module poverty-guidelines
 */

/** Base guideline amount for a household of 1 person (48 contiguous states) */
export const POVERTY_2026_BASE = 15960;

/** Increment added per additional household member beyond the first */
export const POVERTY_2026_PER_ADDITIONAL_PERSON = 5680;

/**
 * Barrel export object — matches the shape expected by poverty-guidelines.test.ts.
 * The individual named constants above remain the canonical exports.
 */
export const POVERTY_GUIDELINES_2026 = {
  baseAmount: POVERTY_2026_BASE,
  perAdditionalPerson: POVERTY_2026_PER_ADDITIONAL_PERSON,
} as const;

/**
 * Returns the 125% Federal Poverty Guideline threshold for the given household size.
 * Formula: (baseAmount + (householdSize - 1) * perAdditionalPerson) * 1.25
 */
export function get125PercentThreshold(householdSize: number): number {
  const guideline =
    POVERTY_2026_BASE + (householdSize - 1) * POVERTY_2026_PER_ADDITIONAL_PERSON;
  return guideline * 1.25;
}
```

**Verified threshold values (for test authoring):**

| Household Size | FPG 100% | FPG 125% (I-864 minimum) |
|----------------|----------|--------------------------|
| 1 | $15,960 | $19,950 |
| 2 | $21,640 | $27,050 |
| 3 | $27,320 | $34,150 |
| 4 | $33,000 | $41,250 |
| 5 | $38,680 | $48,350 |
| 6 | $44,360 | $55,450 |
| 7 | $50,040 | $62,550 |
| 8 | $55,720 | $69,650 |

Source: HHS ASPE 2026 computations page (HIGH confidence — directly fetched from aspe.hhs.gov).

### Pattern 2: CaseStep Save/Load (income-calculator)

**CRITICAL BLOCKER — Read before planning.**

The existing `/api/dashboard/steps` PATCH route validates `stepSlug` via `isDashboardStepSlug()`:

```typescript
// src/lib/dashboard-steps.ts (current state)
const stepSlugSet = new Set<string>(DASHBOARD_STEPS.map((step) => step.slug));

export function isDashboardStepSlug(value: string): value is DashboardStepSlug {
  return stepSlugSet.has(value);
}
```

`DASHBOARD_STEPS` currently contains: `personal-info`, `spouse-info`, `marriage-details`, `immigration-info`, `documents`, `review`.

`"income-calculator"` is NOT in this set. A PATCH request with `stepSlug: "income-calculator"` will fail validation and return:
```json
{ "error": "Invalid payload", "details": { "formErrors": ["Invalid stepSlug"] } }
```

**The planner MUST add `"income-calculator"` to `DASHBOARD_STEPS` as Wave 0 or the first task of Wave 1.** Mark it `critical: false` (it's supplementary, not a required process step).

The Prisma `CaseStep.stepSlug` column is a plain `String` — no enum constraint at the DB level. Only the application-layer `isDashboardStepSlug` guard needs updating.

**PATCH request shape (confirmed from route.ts):**
```typescript
// Request body
{
  stepSlug: "income-calculator",         // string, validated against DASHBOARD_STEPS
  status: "IN_PROGRESS" | "COMPLETED",  // optional: StepStatus enum
  data: {                                // optional: Record<string, unknown>
    qualified: boolean,
    threshold: number,
    householdSize: number,
    annualIncome: number,
  }
}
```

**Response shape:**
```json
{ "step": { "id": "...", "stepSlug": "income-calculator", "status": "IN_PROGRESS", "data": {...} } }
```

**Pre-fill on load pattern (from `immigration-info-client.tsx`):**

Server Component reads the CaseStep data and passes it as a prop to the client widget:

```typescript
// page.tsx (Server Component)
export const dynamic = "force-dynamic";

import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { asStepData } from "@/lib/case-step-data";
import { IncomeCalculatorClient } from "./income-calculator-client";

export default async function IncomeCalculatorPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) redirect("/login");

  const step = await prisma.caseStep.findUnique({
    where: {
      userProfileId_stepSlug: {
        userProfileId: context.userProfile.id,
        stepSlug: "income-calculator",
      },
    },
  });

  const existingData = asStepData(step?.data);
  return <IncomeCalculatorClient existingData={existingData} />;
}
```

```typescript
// income-calculator-client.tsx (Client Component)
"use client";
import { useState } from "react";

interface IncomeCalculatorClientProps {
  existingData: Record<string, unknown>;
}

export function IncomeCalculatorClient({ existingData }: IncomeCalculatorClientProps) {
  const [householdSize, setHouseholdSize] = useState(
    (existingData.householdSize as number) ?? 2
  );
  const [annualIncome, setAnnualIncome] = useState(
    (existingData.annualIncome as number) ?? 0
  );
  // ... rest of component
}
```

### Pattern 3: Dashboard Page Server Component Boilerplate

From `documents/page.tsx`:

```typescript
export const dynamic = "force-dynamic";

import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { redirect } from "next/navigation";
// ... other imports

export default async function PageName() {
  const context = await getCurrentUserAndProfile();
  if (!context) redirect("/login");

  // fetch data...

  return <ClientComponent initialData={...} />;
}
```

Both new pages go under `src/app/dashboard/` directly (not under the `(panel)` route group, which shows the "Immigration Timeline" heading and is for the 6 canonical case steps). The documents page confirms this: it sits at `src/app/dashboard/documents/page.tsx` outside `(panel)/`.

### Pattern 4: Amber Warning Banner (`EwiWarning` from `initial-screener.tsx`)

The AP travel warning reuses this exact pattern:

```typescript
// Source: src/components/initial-screener.tsx — EwiWarning export
function ApTravelWarning() {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 text-sm"
      style={{
        background: "var(--color-warning-bg, #fffbeb)",
        borderLeftColor: "var(--color-warning-border, #fcd34d)",
        color: "var(--color-warning-text, #92400e)",
      }}
    >
      <svg ...triangle warning icon... />
      <div>
        <p className="font-semibold">Do not travel without Advance Parole</p>
        <p className="mt-0.5">
          Do not travel outside the U.S. while your I-485 is pending without an
          approved Advance Parole document (Form I-131). Leaving without AP will
          typically abandon your application.
        </p>
      </div>
    </div>
  );
}
```

CSS variable values confirmed from `globals.css`:
- `--color-warning-bg: #fffbeb`
- `--color-warning-border: #fcd34d`
- `--color-warning-text: #92400e`

### Pattern 5: Sidebar Navigation

The sidebar uses a `MENU_ITEMS` array in `src/components/dashboard-sidebar.tsx`. Each item has `href`, `labelKey` (a `TranslationKey`), and an inline SVG `icon`.

**Active link detection:** `isActive` does `pathname.startsWith(href)` for non-root hrefs, so `/dashboard/income-calculator` and `/dashboard/submission` will auto-highlight correctly if added.

**To add a nav item, three files must change:**
1. `src/lib/translations.ts` — add new key to both `en` and `pt-BR` objects (e.g., `"sidebar.incomeCalculator"` and `"sidebar.submission"`)
2. `src/components/dashboard-sidebar.tsx` — add entry to `MENU_ITEMS` array with the new `labelKey`
3. TypeScript will enforce that the `labelKey` value exists in `TranslationKey` — adding to translations.ts must happen first

`TranslationKey` is derived as `keyof typeof translations["en"]`, so adding to the `en` object automatically widens the type.

### Pattern 6: Form Packs Data — Submission Page Download List

From `src/lib/form-packs.ts`, the `FORM_PACKS` array has 6 entries. Each `FormPack` has:

```typescript
interface FormPack {
  id: string;          // e.g. "i130", "i485"
  label: string;       // e.g. "Form I - 130"
  detailLabel: string; // e.g. "I - 130 / I - 130a"
  coverPdfUrl: string; // e.g. "/forms/i130-petition.pdf" — local PDF
  forms: FormItem[];   // array of individual form PDFs
  uscisUrl: string;    // e.g. "https://www.uscis.gov/i-130" — official USCIS page
  // ...
}

interface FormItem {
  id: string;
  title: string;
  pdfUrl: string;  // e.g. "/forms/i130-petition.pdf"
}
```

**6 form packs in FORM_PACKS:** `i130`, `i131`, `i485`, `i693`, `i765`, `i864a`.

The submission page's download list can map over `FORM_PACKS` and render a row per pack with:
- `pack.label` or `pack.detailLabel` as the display name
- `pack.coverPdfUrl` for a direct PDF download link
- `pack.uscisUrl` for the official USCIS form page

`FORM_PACKS` is imported directly from `@/lib/form-packs` — no API call needed (it's a pure static array).

### Anti-Patterns to Avoid

- **Hardcoding lockbox addresses:** D-10 is explicit — link to `https://www.uscis.gov/i-485`, never a street address string. Addresses change and USCIS varies by state.
- **Using the `(panel)` route group for these pages:** The `(panel)` layout adds an "Immigration Timeline" heading and is scoped to the 6 canonical case steps. New utility pages like income-calculator and submission belong directly under `src/app/dashboard/`, not under `(panel)/`.
- **Forgetting to add `"income-calculator"` to `DASHBOARD_STEPS`:** The `/api/dashboard/steps` PATCH will return 400 without this. This is a required prerequisite task.
- **External fetching for poverty guidelines:** D-02 locks these as hardcoded. No fetch.
- **Persisting checklist state:** D-09 is explicit — component state only for v1.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Warning banner styling | Custom CSS amber alert | `EwiWarning` pattern from `initial-screener.tsx` | Already tested, uses project CSS vars |
| CaseStep persistence | Direct Prisma calls from client | `/api/dashboard/steps` PATCH | Established pattern with auth, Zod validation, upsert |
| Poverty guideline data | HHS API fetch or DB table | Hardcoded `poverty-guidelines.ts` | D-02 mandates it; simpler and offline-safe |
| Form list data | New API or DB table | Import `FORM_PACKS` directly | Static array, already maintained |
| Conditional class merging | Manual string interpolation | `cn()` from `@/lib/utils` | Project standard (clsx + tailwind-merge) |

---

## Common Pitfalls

### Pitfall 1: `isDashboardStepSlug` Blocks the Calculator Save

**What goes wrong:** The PATCH request with `stepSlug: "income-calculator"` returns 400 with `"Invalid stepSlug"` because `isDashboardStepSlug` validates against `DASHBOARD_STEPS`.

**Why it happens:** The guard was written for the original 6 steps. The `stepSlug` field in Prisma is a plain `String`, but the application layer is strict.

**How to avoid:** Add `"income-calculator"` to `DASHBOARD_STEPS` in `src/lib/dashboard-steps.ts` before any calculator save code runs. Mark it `critical: false, order: 7` (or another available order).

**Warning signs:** 400 response from `/api/dashboard/steps` with `details.formErrors: ["Invalid stepSlug"]`.

### Pitfall 2: New Pages Placed Inside `(panel)` Route Group

**What goes wrong:** Pages under `src/app/dashboard/(panel)/` inherit the "Immigration Timeline" panel layout with its "My Case" label, step subheadings, and navigation structure designed for the 6 canonical case steps.

**Why it happens:** The `(panel)` directory exists and developers may use it by default.

**How to avoid:** Place new pages directly under `src/app/dashboard/income-calculator/` and `src/app/dashboard/submission/`. The dashboard root layout (`src/app/dashboard/layout.tsx`) applies to all routes and provides the `DashboardShell` wrapper — that's all these pages need.

**Warning signs:** Page shows "Immigration Timeline" heading and "My Case" label it shouldn't have.

### Pitfall 3: Translations Key Type Error for Sidebar Items

**What goes wrong:** TypeScript error when adding a new `labelKey` to `MENU_ITEMS` because the key doesn't exist in `TranslationKey`.

**Why it happens:** `TranslationKey = keyof typeof translations["en"]` — it's a literal union type. Any key not in `translations.en` fails the type check.

**How to avoid:** Add the new key to both `en` AND `pt-BR` objects in `src/lib/translations.ts` before modifying `MENU_ITEMS`. The PT-BR value can be a reasonable translation or a copy of the English label.

**Warning signs:** TypeScript error: `Type '"sidebar.incomeCalculator"' is not assignable to type 'TranslationKey'`.

### Pitfall 4: `asStepData` Must Be Called on CaseStep Data Before Passing to Client

**What goes wrong:** The `CaseStep.data` column is typed as `Prisma.JsonValue` which can be `string | object | null`. Passing it directly to the client component causes type errors or silent `null` returns.

**Why it happens:** Prisma's `Json` type is polymorphic.

**How to avoid:** Always call `asStepData(step?.data)` before passing as props. It handles all three cases and always returns `Record<string, unknown>`.

---

## Code Examples

### Income Calculator — Threshold Calculation

```typescript
// src/lib/poverty-guidelines.ts
export const POVERTY_GUIDELINES_2026 = {
  baseAmount: 15960,
  perAdditionalPerson: 5680,
} as const;

export function get125PercentThreshold(householdSize: number): number {
  const guideline =
    15960 + (householdSize - 1) * 5680;
  return Math.round(guideline * 1.25);  // round to nearest dollar
}
// householdSize=2 → Math.round(21640 * 1.25) = 27050
// householdSize=4 → Math.round(33000 * 1.25) = 41250
```

### CaseStep Save — Calculator Client Component

```typescript
// income-calculator-client.tsx
async function handleCalculate() {
  const threshold = get125PercentThreshold(householdSize);
  const qualified = annualIncome >= threshold;

  const response = await fetch("/api/dashboard/steps", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stepSlug: "income-calculator",
      status: "IN_PROGRESS",
      data: {
        ...existingData,  // preserve any other fields
        qualified,
        threshold,
        householdSize,
        annualIncome,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to save.");
  }
}
```

### Submission Page — Form Download List

```typescript
// submission-client.tsx (static, no fetch needed)
import { FORM_PACKS } from "@/lib/form-packs";

// Map each pack to a download row
{FORM_PACKS.map((pack) => (
  <div key={pack.id} className="flex items-center justify-between py-3 border-b border-slate-100">
    <span className="text-sm font-medium text-slate-900">{pack.detailLabel}</span>
    <div className="flex gap-3">
      <a
        href={pack.coverPdfUrl}
        download
        className="text-sm text-[var(--color-trust)] hover:underline"
      >
        Download PDF
      </a>
      <a
        href={pack.uscisUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-slate-500 hover:underline"
      >
        USCIS.gov
      </a>
    </div>
  </div>
))}
```

### DASHBOARD_STEPS Addition

```typescript
// src/lib/dashboard-steps.ts — add income-calculator entry
export const DASHBOARD_STEPS = [
  // ... existing 6 entries ...
  {
    slug: "income-calculator",
    title: "Income Calculator",
    description: "Verify petitioner income meets the 125% federal poverty guideline.",
    critical: false,
    order: 7
  }
] as const;
```

Note: `DashboardStepSlug` is derived as `(typeof DASHBOARD_STEPS)[number]["slug"]`, so it automatically expands to include `"income-calculator"` after the addition. No manual type editing needed.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate `/api/income-calculator` route | Reuse `/api/dashboard/steps` PATCH | Phase 1 established pattern | No new route needed |
| Global CSS classes | Tailwind + CSS vars for theming | Project baseline | Use `--color-warning-*` vars, not hardcoded hex |

---

## Open Questions

1. **Should sidebar nav items be added for both new pages?**
   - What we know: CONTEXT.md marks this as Claude's discretion
   - What's unclear: Whether planner should add them in Phase 3 or treat as deferred
   - Recommendation: Add both. The pages are reachable but invisible without nav. Adding nav items is low risk and requires only 3-file changes (translations.ts + dashboard-sidebar.tsx). Sidebar items for income-calculator and submission fit naturally after the "Forms" item.

2. **Rounding of threshold amounts**
   - What we know: The formula can produce non-round numbers at some household sizes
   - What's unclear: Whether threshold displayed to user should be `$27,050` or `$27,050.00`
   - Recommendation: Use `Math.round()` in `get125PercentThreshold` and format with `toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })`.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is purely code/config changes. No external tools, services, or CLI utilities beyond the project's existing Next.js/Supabase/Prisma stack.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CALC-02 | `get125PercentThreshold(n)` returns correct amounts for household sizes 1–8 | unit | `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts` | Wave 0 |
| CALC-02 | `POVERTY_GUIDELINES_2026.baseAmount` = 15960, `perAdditionalPerson` = 5680 | unit | `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts` | Wave 0 |
| CALC-03 | `isDashboardStepSlug("income-calculator")` returns true after DASHBOARD_STEPS addition | unit | `npx vitest run src/__tests__/lib/` | Wave 0 |
| SUB-01 | `FORM_PACKS` has uscisUrl + pdfUrl for all 6 packs (existing test covers partial) | unit | `npx vitest run src/__tests__/lib/form-packs.test.ts` | existing |
| CALC-01, CALC-04, SUB-02, SUB-03, SUB-04 | UI interaction, save flow, link navigation | manual | N/A — manual browser testing | manual-only |

UI tests are marked manual-only because they require a live Supabase session (auth-gated pages).

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/lib/poverty-guidelines.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lib/poverty-guidelines.test.ts` — covers CALC-02 threshold math and POVERTY_GUIDELINES_2026 shape
- [ ] `src/__tests__/lib/dashboard-steps.test.ts` — covers CALC-03: `isDashboardStepSlug("income-calculator")` after slug addition (file likely absent — check with `ls src/__tests__/lib/`)

*(Existing `src/__tests__/lib/form-packs.test.ts` already covers SUB-01 partially — verify it checks `uscisUrl` fields)*

---

## Project Constraints (from CLAUDE.md)

All directives below are mandatory. Planner must verify compliance per task.

- **Tech stack locked:** Next.js 15 + Supabase + Prisma only. No new framework additions.
- **TypeScript strict mode:** `"strict": true`, `allowJs: false`. All new files must be `.ts` / `.tsx`.
- **File naming:** `kebab-case` for all filenames. `poverty-guidelines.ts`, `income-calculator-client.tsx`, `submission-client.tsx`.
- **Path alias:** Use `@/` for all internal imports. Never relative `../../`.
- **No raw CSS files:** Tailwind utility classes only. CSS vars via inline `style` prop only.
- **`cn()` for conditional classes:** Import from `@/lib/utils`.
- **External links:** Always `target="_blank" rel="noopener noreferrer"` for USCIS links.
- **API auth pattern:** Every route handler calls `getCurrentUserAndProfile()` and returns 401 if null. (No new route handlers needed in Phase 3, but if any are added they must follow this.)
- **`export const dynamic = "force-dynamic"`:** Required on all dashboard page Server Components.
- **Zod validation:** Required if any new API route is added (not needed in Phase 3).
- **Test files:** Placed in `src/__tests__/` not co-located. Extension `*.test.ts` or `*.test.tsx`.
- **AOS only:** All content scoped to marriage-based AOS. No other visa categories.
- **Vercel deployment target:** Avoid long-running server processes, large bundles, edge-incompatible Node APIs.

---

## Sources

### Primary (HIGH confidence)
- HHS ASPE official page — https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines — 2026 FPG base $15,960 + $5,680/person, published January 2026
- HHS ASPE computations page — https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines/prior-hhs-poverty-guidelines-federal-register-references/2026-poverty-guidelines-computations — confirmed base and increment amounts
- Codebase: `src/lib/fee-schedule.ts` — pattern source for poverty-guidelines.ts
- Codebase: `src/lib/dashboard-steps.ts` — confirmed `"income-calculator"` not in current DASHBOARD_STEPS
- Codebase: `src/app/api/dashboard/steps/route.ts` — confirmed PATCH schema and stepSlug validation
- Codebase: `src/app/dashboard/immigration-info/immigration-info-client.tsx` — pre-fill pattern
- Codebase: `src/lib/form-packs.ts` — FORM_PACKS array, all 6 packs with uscisUrl and pdfUrl fields
- Codebase: `src/app/globals.css` — warning CSS variables confirmed
- Codebase: `src/components/initial-screener.tsx` — EwiWarning component pattern
- Codebase: `src/app/dashboard/documents/page.tsx` — Server Component page boilerplate
- Codebase: `src/components/dashboard-sidebar.tsx` — MENU_ITEMS structure and TranslationKey dependency
- Codebase: `src/lib/translations.ts` — TranslationKey type and sidebar label keys

### Secondary (MEDIUM confidence)
- WebSearch corroboration: $15,960 base FPL for 2026 confirmed by multiple sources (benefitsusa.org, factually.co)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing
- Poverty guidelines data: HIGH — fetched directly from HHS ASPE official pages
- CaseStep slug blocker: HIGH — read directly from source code; `isDashboardStepSlug` confirmed
- Architecture patterns: HIGH — all read directly from project source files
- Pitfalls: HIGH — derived from actual source code constraints, not inferred

**Research date:** 2026-04-17
**Valid until:** 2027-02-01 (poverty guidelines update annually in January/February; all other patterns are code-stable)

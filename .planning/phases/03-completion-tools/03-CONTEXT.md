# Phase 3: Completion Tools - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver two completion-oriented capabilities:
1. **I-864 Income Calculator** — lets the petitioner verify their household income meets the 125% federal poverty guideline threshold for sponsorship, and explains joint sponsor requirements if it doesn't
2. **Submission packet page** — a "Ready to Submit" page listing all forms for download, a packet assembly checklist, a live USCIS lockbox address link, and a prominent AP travel warning

No PDF auto-fill in this phase (that's Phase 4+). No new auth or chat features. Scope is strictly CALC-01–04 and SUB-01–04.

</domain>

<decisions>
## Implementation Decisions

### Income Calculator (CALC-01, CALC-02, CALC-03, CALC-04)
- **D-01:** Calculator lives at `/dashboard/income-calculator` — a standalone Server Component page with a client-side calculator widget. Gives it full vertical space to explain the 125% rule, show the threshold, and allow re-entry cleanly.
- **D-02:** Poverty guidelines hardcoded in `src/lib/poverty-guidelines.ts` with a prominent comment: `// HHS 2026 Federal Poverty Guidelines — update annually (published Jan/Feb each year)`. No external fetch; keeps it fast and offline-safe.
- **D-03:** Data shape: `POVERTY_GUIDELINES_2026 = { baseAmount: number, perAdditionalPerson: number }` — threshold = baseAmount + (householdSize - 1) × perAdditionalPerson. The 125% threshold is `threshold × 1.25`.
- **D-04:** Calculator result (qualified: boolean, threshold: number, householdSize: number, annualIncome: number) saved to `CaseStep.data` under `stepSlug = "income-calculator"` on each calculation. Reuses the established CaseStep upsert pattern from prior phases. Pre-fills fields on revisit.
- **D-05:** If income is insufficient, the UI shows a clear explanation: minimum joint sponsor income requirements (same 125% threshold but for the joint sponsor's household), and links to the USCIS I-864 instructions page for full eligibility rules.
- **D-06:** Calculator is purely client-side — no API route needed. The save-to-CaseStep on submit goes through the existing `/api/dashboard/steps` route.

### Submission Page (SUB-01, SUB-02, SUB-03, SUB-04)
- **D-07:** Submission lives at `/dashboard/submission` — a new Server Component page. Houses all four SUB requirements in one place: form download list, assembly checklist, USCIS lockbox link, and AP travel warning.
- **D-08:** "Download all filled PDFs" is implemented as a list of individual form download links (one per form pack) — not a ZIP and not a merged PDF. Each link points to the existing form PDF or the USCIS download page. A single-ZIP bundle is deferred to a later phase.
- **D-09:** Submission checklist is a static interactive checklist (client-side checkbox state, not persisted to DB in Phase 3). Items cover: confirm all forms signed, include required supporting docs, confirm correct edition, attach payment, confirm USCIS lockbox address, read AP travel warning. Checkbox state stored in component state only — no CaseStep persistence needed for v1.
- **D-10:** USCIS lockbox address is NOT hardcoded. The page links to `https://www.uscis.gov/i-485` (the official filing instructions page that lists current lockbox addresses). The UI text explains: "USCIS lockbox addresses change — always use the official USCIS.gov filing instructions." Never display an address string directly.
- **D-11:** AP travel warning on the submission page is a prominent static banner (same amber/warning color as the EWI warning from Phase 2) shown above the checklist. Text: "Do not travel outside the U.S. while your I-485 is pending without an approved Advance Parole document (Form I-131). Leaving without AP will typically abandon your application." Reuses existing `--color-warning-*` CSS variables.

### Claude's Discretion
- Exact poverty guidelines numbers for 2026 (researcher to verify from HHS source)
- Calculator widget layout (inline form vs card, result display style)
- Submission page section order (form list vs checklist vs address vs warning)
- Whether to add a navigation link to `/dashboard/submission` in the sidebar (and where)
- Whether to add a navigation link to `/dashboard/income-calculator` in the sidebar

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Income Calculator
- `src/lib/fee-schedule.ts` — Existing pattern for hardcoded USCIS financial data with JSDoc maintenance comments. Follow this exact pattern for `poverty-guidelines.ts`.
- `src/lib/dashboard-steps.ts` — 6 canonical step slugs. `income-calculator` is a new slug — check for conflicts and follow the upsert pattern.
- `src/app/api/dashboard/steps/route.ts` — Existing CaseStep upsert API. The calculator save goes through this route with `stepSlug: "income-calculator"`.

### Submission Page
- `src/lib/form-packs.ts` — All 6 form pack entries with `uscisUrl` and `pdfUrl` fields. The submission page pulls from this to build the form download list.
- `src/app/globals.css` — `--color-warning-*` CSS variables defined here (added in Phase 2). Use for the AP travel warning banner.
- `src/components/initial-screener.tsx` — `EwiWarning` component export. Submission page AP banner can follow the same amber banner pattern.
- `src/components/upl-disclaimer.tsx` — Existing legal disclaimer component pattern. Reference for static warning banner structure.

### Prior Phase Patterns
- `src/app/dashboard/immigration-info/immigration-info-client.tsx` — CaseStep save pattern with pre-fill on load. Follow this for the calculator's save/load behavior.
- `src/app/dashboard/documents/page.tsx` — Server Component page pattern with `export const dynamic = "force-dynamic"`. Follow for both new pages.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/fee-schedule.ts` — Pattern and JSDoc style for the new `poverty-guidelines.ts` module
- `EwiWarning` (in `initial-screener.tsx`) — Amber warning banner pattern for the AP travel warning on submission page
- `UplDisclaimer` (`src/components/upl-disclaimer.tsx`) — Static legal banner pattern
- `src/app/api/dashboard/steps/route.ts` — CaseStep upsert for saving calculator results
- `src/lib/form-packs.ts` — `FORM_PACKS` array with `uscisUrl` for the submission form list
- `--color-warning-*` CSS variables in `globals.css` — warning amber colors already defined

### Established Patterns
- CaseStep pre-fill on revisit: read `CaseStep.data` in Server Component, pass as `initialValues` prop to client form (see `immigration-info-client.tsx`)
- New dashboard pages: `export const dynamic = "force-dynamic"`, Server Component fetching, Client Component for interactivity
- External links: always `target="_blank" rel="noopener noreferrer"` pointing to `uscis.gov`

### Integration Points
- `/dashboard/income-calculator` — new route under the existing dashboard `(panel)` layout
- `/dashboard/submission` — new route under the existing dashboard `(panel)` layout
- Dashboard sidebar (`src/components/dashboard-sidebar.tsx`) — researcher/planner to decide if new nav items are needed

</code_context>

<specifics>
## Specific Ideas

- Poverty guidelines module should follow `fee-schedule.ts` structure exactly (named exports + barrel object + JSDoc with source/year)
- The "125% threshold" calculation: `(baseAmount + (householdSize - 1) * perAdditionalPerson) * 1.25`
- Joint sponsor explanation should not just say "you need a joint sponsor" — it should explain what that means: the joint sponsor must independently meet the 125% threshold for *their own* household size
- USCIS lockbox link: direct to `https://www.uscis.gov/i-485` filing instructions, not a generic USCIS.gov homepage

</specifics>

<deferred>
## Deferred Ideas

- ZIP download of all filled PDFs — deferred to Phase 4+ (PDF auto-fill phase)
- Persisting checklist state to CaseStep — deferred; component state sufficient for v1
- State-based USCIS lockbox routing (different addresses by petitioner's state) — deferred; link to USCIS.gov locator is sufficient for v1
- Navigation sidebar updates — Claude's discretion in planning

</deferred>

---

*Phase: 03-completion-tools*
*Context gathered: 2026-04-17*

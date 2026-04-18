# Phase 4: Interview Prep - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a complete Interview Prep section at `/dashboard/interview` — an expanded question bank organized by USCIS category, role-differentiated tips for petitioner and beneficiary, and an interactive what-to-bring checklist. The existing skeleton page is refactored to project conventions.

No new database models. No new API routes. Scope is strictly INT-01 through INT-04.

</domain>

<decisions>
## Implementation Decisions

### Existing Page Treatment (INT-01, INT-02)
- **D-01:** Refactor `/dashboard/interview/page.tsx` — do NOT rewrite from scratch. The flashcard flip interaction and section structure (questions, checklist, tips) are retained. Fix conventions: convert to Server Component shell + client widget, replace indigo/slate colors with project palette (`text-zinc-*`, `--color-warning-*`, olive/navy accent where appropriate), add `export const dynamic = "force-dynamic"`.
- **D-02:** Move all interactive state (flashcard flip, checklist) into a single `"use client"` component: `src/app/dashboard/interview/interview-client.tsx`. The server page reads the user role and passes it as a prop.

### Question Bank (INT-01, INT-02)
- **D-03:** Expand the question bank to approximately 28–32 questions across 4 USCIS categories. Categories:
  1. **Relationship History** — first meeting, proposal, wedding day
  2. **Daily Life & Cohabitation** — routines, home, family knowledge
  3. **Personal & Immigration History** — travel, documents, employment
  4. **Forms & Documents** — awareness of what was filed and when
- **D-04:** Questions defined as a hardcoded constant in the client component (no CMS/DB). Each question has: `id`, `category`, `question`, `answerTip` (guidance for answering, replaces old "answer" field).
- **D-05:** Category filter tabs above the question grid. Clicking a tab filters visible questions to that category. "All" tab shows all questions. Active tab styled with project olive accent.

### Role-Differentiated Tips (INT-04)
- **D-06:** Tips section shows two sub-sections: "For the Petitioner (U.S. Citizen)" and "For the Beneficiary (Immigrant Spouse)". Server Component reads `userProfile.role` (or a role hint from CaseStep if available) and passes the user's role to the client — client component highlights the user's own section with a subtle border/accent.
- **D-07:** Each role section has 4–5 tips covering: demeanor, what to expect when interviewed separately, common officer questions, documents to know cold. General tips (dress, honesty, calm) remain in a shared "General Tips" sub-section.

### What-to-Bring Checklist (INT-03)
- **D-08:** Interactive checkboxes with component state only — same pattern as Phase 3 submission checklist (`useState` array of checked IDs). No CaseStep persistence needed in Phase 4.
- **D-09:** Checklist items: Interview Notice (I-797C), valid passports (both), state IDs, original marriage certificate, original birth certificates, bona fide evidence (photos + joint financial docs), medical exam (I-693) if not previously submitted, any requested RFE response documents. Show a "Ready for interview" confirmation when all items are checked.

### Claude's Discretion
- Exact wording of the 28–32 questions and tips
- Visual layout of category tabs (pill tabs vs underline tabs)
- Whether to show question count per category in the tab
- Section ordering on the page (questions first vs checklist first)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Interview Page (to refactor)
- `src/app/dashboard/interview/page.tsx` — Current skeleton; contains the flashcard data, what-to-bring list, and tip cards to be refactored. Read before touching to avoid data loss.

### Established Patterns to Follow
- `src/app/dashboard/submission/page.tsx` + `src/app/dashboard/submission/submission-client.tsx` — Server + client split pattern for this phase; checklist state management pattern.
- `src/app/dashboard/income-calculator/page.tsx` — Server Component reading userProfile + passing prop to client widget.
- `src/components/dashboard-sidebar.tsx` + `src/lib/translations.ts` — If a nav item for interview prep isn't already present, check and add (sidebar already likely has it from prior phases — verify before adding duplicate).

### Design System
- `src/app/globals.css` — `--color-warning-*` CSS variables (amber). Project palette is zinc/black/white + olive accent.
- `src/components/upl-disclaimer.tsx` — Static banner pattern.
- `tailwind.config.ts` — Custom color palette (sand, olive, navy) — use these, not indigo/slate.

### Role Context
- `src/lib/current-user-profile.ts` — `getCurrentUserAndProfile()` returns `userProfile.role` — use this to pass user role to client.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/dashboard/interview/page.tsx` — Existing content (questions, checklist items, tips) to migrate. Do not discard the content — refactor it.
- `src/components/ui/dashboard-card.tsx` — Used in current interview page; can be kept if it uses project colors, or replaced with plain Tailwind divs if it uses wrong palette.
- Submission checklist pattern (`submission-client.tsx`) — `useState` checkbox array, "ready" confirmation message — reuse this pattern exactly.

### Established Patterns
- Server Component default with `"use client"` client widget: all pages in `/dashboard/` follow this
- `export const dynamic = "force-dynamic"` required on all dashboard Server Component pages
- `getCurrentUserAndProfile()` for auth + role in Server Component, returns null → 401
- Tailwind only: no CSS modules; inline `style` only for CSS variables
- External links: `target="_blank" rel="noopener noreferrer"`

### Integration Points
- `/dashboard/interview` — existing route under `(panel)` layout
- Sidebar nav: verify `dashboard-sidebar.tsx` already has an interview nav item (likely does from existing page); do NOT add duplicate
- `userProfile.role` from `getCurrentUserAndProfile()` — passes user role for tip differentiation

</code_context>

<specifics>
## Specific Ideas

- Category filter: pill-style tabs above the flashcard grid, "All" tab default, olive accent on active
- Flashcard flip: keep the existing click-to-reveal interaction (opacity fade, not 3D flip — keeps it accessible)
- Role tips: highlight the current user's role section with a subtle left border in olive, other role section is normal weight
- "Ready for interview" message on checklist: same pattern as Phase 3 "packet is ready to mail" confirmation

</specifics>

<deferred>
## Deferred Ideas

- Persisting checklist state to CaseStep — same as Phase 3, deferred; component state sufficient for v1
- Practice mode (hide answers by default, score yourself) — could be a Phase 5+ enhancement
- Interview scheduling / appointment tracking — out of scope for v1 (no USCIS API)
- Role-based question filtering (show only petitioner-relevant questions) — deferred; all questions are relevant to both spouses in a joint interview prep context

</deferred>

---

*Phase: 04-interview-prep*
*Context gathered: 2026-04-17*

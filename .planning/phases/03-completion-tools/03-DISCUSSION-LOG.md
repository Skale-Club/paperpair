# Phase 3: Completion Tools - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 03-completion-tools
**Areas discussed:** Calculator placement, Poverty guidelines data, Submission package format, Submission checklist design

---

## Calculator Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone dashboard page | `/dashboard/income-calculator` — full vertical space, clean re-entry | ✓ |
| Embedded in I-864 form pack panel | Inside the forms browser — less discoverable | |
| Dashboard sidebar widget | Compact widget — limited space for explanation | |

**User's choice:** "do the recommended for you" — Claude applied recommended: standalone page
**Notes:** Gives full space to explain the 125% rule and show threshold clearly.

---

## Poverty Guidelines Data

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded in config file | `poverty-guidelines.ts` with maintenance comment — fast, offline-safe | ✓ |
| External fetch | Fetch from HHS URL — risky (URL changes, network dependency) | |

**User's choice:** "do the recommended for you" — Claude applied recommended: hardcoded with maintenance note
**Notes:** Calculator result saved to CaseStep for pre-fill on revisit.

---

## Submission Package Format

| Option | Description | Selected |
|--------|-------------|----------|
| Individual download links | List per form — simple, reliable, no server-side ZIP generation | ✓ |
| ZIP of all PDFs | Single download — requires server-side ZIP generation | |
| Merged single PDF | Combined document — complex, ordering matters | |

**User's choice:** "do the recommended for you" — Claude applied recommended: individual links
**Notes:** ZIP/merged PDF deferred to Phase 4+ when PDF auto-fill is built.

---

## Submission Checklist Design

| Option | Description | Selected |
|--------|-------------|----------|
| New dedicated page `/dashboard/submission` | Self-contained, all SUB requirements together | ✓ |
| Section in existing timeline | Less discoverable, mixes concerns | |
| Modal/panel | Space-constrained for a full checklist | |

**User's choice:** "do the recommended for you" — Claude applied recommended: dedicated page
**Notes:** Houses checklist + USCIS lockbox link + AP travel warning in one place.

---

## Claude's Discretion

- Exact 2026 HHS poverty guideline numbers (researcher to verify)
- Calculator widget layout details
- Submission page section order
- Sidebar navigation link placement for both new pages

## Deferred Ideas

- ZIP bundle of all PDFs — Phase 4+
- Checklist state persistence to DB — v1 component state is sufficient
- State-based USCIS lockbox routing — link to USCIS.gov locator is sufficient

# Phase 4: Interview Prep - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 04-interview-prep
**Areas discussed:** Existing page treatment, Question bank scope, Role differentiation for tips, Checklist interactivity

---

## Existing Page Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Refactor | Fix conventions (Server + client split, project palette), keep content and flashcard interaction | ✓ |
| Full rewrite | Start fresh, discard existing content | |

**User's choice:** "do recommended" — Claude applied recommended: refactor
**Notes:** Existing flashcard flip interaction is good. Colors (indigo/slate) and all-client structure are the only problems.

---

## Question Bank Scope

| Option | Description | Selected |
|--------|-------------|----------|
| 4 categories × 6–8 questions (~28–32 total) | Relationship History, Daily Life, Personal/Immigration History, Forms & Documents | ✓ |
| Keep existing 6 questions | Minimal — stub only | |
| 2 categories × 5 questions (10 total) | Relationship + Daily Life only | |

**User's choice:** "do recommended" — Claude applied recommended: expanded bank
**Notes:** Category filter tabs added to navigate between categories.

---

## Role Differentiation for Tips

| Option | Description | Selected |
|--------|-------------|----------|
| Role-differentiated tips | Petitioner section + Beneficiary section, server reads role and highlights user's own section | ✓ |
| Generic tips only | Same tips for everyone — simpler but less useful | |

**User's choice:** "do recommended" — Claude applied recommended: role-differentiated
**Notes:** General tips (honesty, calm, dress) remain in a shared section. Role-specific tips cover being interviewed separately, documents to know cold.

---

## Checklist Interactivity

| Option | Description | Selected |
|--------|-------------|----------|
| Interactive checkboxes (component state) | Same pattern as Phase 3 submission checklist — useState, "ready" confirmation when all checked | ✓ |
| Static read-only list | No state, simpler | |

**User's choice:** "do recommended" — Claude applied recommended: interactive checkboxes
**Notes:** No DB persistence needed — component state sufficient for v1.

---

## Claude's Discretion

- Exact wording of 28–32 questions and tips
- Visual layout of category tabs (pill vs underline)
- Whether to show question count per category tab
- Section ordering on the page

## Deferred Ideas

- Persisting checklist to CaseStep — v1 component state is sufficient
- Practice/scoring mode — Phase 5+ enhancement
- Interview scheduling/appointment tracking — no USCIS API
- Role-based question filtering — all questions useful to both spouses

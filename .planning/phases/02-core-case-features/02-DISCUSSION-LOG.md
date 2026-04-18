# Phase 2: Core Case Features - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 02-core-case-features
**Areas discussed:** Screener completion, Forms page guidance, Document upload UX, CASE-04 roles

---

## Screener Completion Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Show a warning, let them continue | Display EWI eligibility note, don't block the app | ✓ |
| Block and redirect | Stop flow, show resources for other options | |
| Claude's discretion | Handle however makes sense | |

**User's choice:** Show warning, let EWI users continue
**Notes:** UPL disclaimer already covers legal risk. Don't block users who may still qualify.

---

## Forms Page Guidance

| Option | Description | Selected |
|--------|-------------|----------|
| Expand existing pack detail panel | Add instructions inside the panel that opens on PackCard click | ✓ |
| Dedicated form detail page | New route per form with more real estate | |
| Claude's discretion | Implement whatever fits the existing UI best | |

**User's choice:** Expand existing panel — no new pages needed
**Notes:** The panel already exists; instructions, download link, and edition warning go inside it.

---

## Document Upload — AI Extraction Timing

| Option | Description | Selected |
|--------|-------------|----------|
| On demand — user clicks 'Extract' | Less surprising, cheaper, user-controlled | ✓ |
| Automatic on upload | Seamless but adds latency and cost per upload | |

**User's choice:** On demand for v1
**Notes:** Reduces cost and upload latency. Good baseline for Phase 2.

---

## CASE-04 in Single-User Context

| Option | Description | Selected |
|--------|-------------|----------|
| Solo user = full access to everything | Role locking only when second user joins | ✓ |
| Apply roles from the start | User picks petitioner/beneficiary at signup | |

**User's choice:** Full access for solo users
**Notes:** Consistent with the decision that spouse invite is optional. Keep solo path frictionless.

---

## Claude's Discretion

- Timeline step filtering logic location
- Exact panel layout for form instructions
- Document list row design
- Chat history GET endpoint response shape

## Deferred Ideas

None raised during discussion.

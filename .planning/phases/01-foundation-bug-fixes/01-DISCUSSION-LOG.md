# Phase 1: Foundation & Bug Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 01-foundation-bug-fixes
**Areas discussed:** Chat persistence schema

---

## Chat Persistence Schema

### Session model

| Option | Description | Selected |
|--------|-------------|----------|
| Single ongoing thread | One persistent conversation per user, always continues where they left off. Simpler schema, matches 'case assistant' mental model. | ✓ |
| Multi-session with history | Users can start new conversations and browse past ones. More complex schema and UI. | |
| Single thread, but resettable | One conversation, but with 'start fresh' that archives old thread. | |

**User's choice:** Single ongoing thread
**Notes:** Matches the iMessage-with-your-advisor mental model.

---

### Message metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: role + content + timestamp | Store who said it, what was said, and when. Enough to restore chat history. | ✓ |
| Extended: add model ID + token counts | Also store which AI model generated the response and token usage. | |
| Full: add tool calls + extracted data ref | Store tool call metadata and link messages to CaseStep updates. | |

**User's choice:** Minimal — role, content, timestamp only

---

### Session association

| Option | Description | Selected |
|--------|-------------|----------|
| User-level (free-floating) | One session belongs to the user, not to any specific step. | ✓ |
| Tied to CaseStep | Each step gets its own chat context and session. | |

**User's choice:** User-level (free-floating)

---

## Claude's Discretion

- Timeline checklist storage model — CaseStep.data with slug "timeline"
- My Forms storage model — CaseStep.data with slug "selected-forms"
- UPL disclaimer placement — shared component, non-dismissible, shown on chat/form/screener pages
- AI legal guardrail approach — system prompt deflection
- PDF Storage bucket organization
- Edition lock implementation approach
- Upstash vs in-memory upgrade decision (deferred to researcher)

## Deferred Ideas

None.

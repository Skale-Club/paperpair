---
phase: 02-core-case-features
plan: "05"
subsystem: chat
tags: [chat, system-prompt, api-route, tdd, advance-parole]

# Dependency graph
requires: []
provides:
  - systemPrompt with AP travel warning (ADVANCE PAROLE, I-485, I-131)
  - GET /api/chat/history returning {messages: AiSdkMessage[]}
  - ChatSession + ChatMessage Prisma models in this worktree
affects: [02-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD GREEN — prompts.test.ts and chat-history.test.ts pass after implementation"
    - "Route handler with auth check + Prisma chatSession.findUnique pattern"

key-files:
  created:
    - src/__tests__/lib/prompts.test.ts
    - src/__tests__/lib/chat-history.test.ts
    - src/app/api/chat/history/route.ts
  modified:
    - src/lib/ai/prompts.ts
    - prisma/schema.prisma

key-decisions:
  - "Legal guardrail (BUG-07 content) added to prompts.ts in this worktree — parallel agents execute independently; merge will reconcile"
  - "ChatSession/ChatMessage Prisma models added as Rule 3 fix — required for route.ts to compile (models were on another worktree branch)"

# Metrics
duration: 10min
completed: 2026-04-17
---

# Phase 2 Plan 05: AP Travel Warning + Chat History Route Summary

**AP travel warning appended to systemPrompt (ADVANCE PAROLE/I-485/I-131) and GET /api/chat/history route created returning persisted messages in AI SDK format**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-04-17
- **Tasks:** 2
- **Files created:** 3
- **Files modified:** 2

## Accomplishments

- Added ADVANCE PAROLE warning block inside systemPrompt template literal — triggers on any travel mention
- Added legal guardrail content to this worktree's prompts.ts (BUG-07 content from Plan 01-03, absent here due to parallel execution)
- Created `src/__tests__/lib/prompts.test.ts` (6 tests: 3 BUG-07 guardrail + 3 CHAT-06 AP warning — all pass)
- Created `src/__tests__/lib/chat-history.test.ts` (4 CHAT-04 shape contract tests — all pass)
- Created `src/app/api/chat/history/route.ts` — GET endpoint with 401 auth guard, chatSession.findUnique, system message filter, createdAt asc ordering

## Task Commits

1. **Task 1: Add AP travel warning to systemPrompt** — `ddfaf59` (feat)
2. **Task 2: Create GET /api/chat/history route** — `dfdf01a` (feat)

## Files Created/Modified

- `src/lib/ai/prompts.ts` — ADVANCE PAROLE warning block + legal guardrail appended inside systemPrompt
- `src/__tests__/lib/prompts.test.ts` — BUG-07 and CHAT-06 test assertions (6 tests pass)
- `src/__tests__/lib/chat-history.test.ts` — CHAT-04 message format shape contract (4 tests pass)
- `src/app/api/chat/history/route.ts` — GET endpoint returning {messages: AiSdkMessage[]}
- `prisma/schema.prisma` — ChatSession + ChatMessage models added (Rule 3 fix)

## Decisions Made

- Legal guardrail content (BUG-07) was not present in this worktree (parallel agent isolation); added here to satisfy prompts.test.ts contract from Plan 01. Merge will reconcile with the Plan 01-03 worktree version — content is identical.
- ChatSession/ChatMessage Prisma models were missing from this worktree's schema (added by Plan 01-01 on another worktree). Added them as a Rule 3 blocking issue fix and ran `prisma generate` to update the client.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ChatSession/ChatMessage Prisma models missing from schema**
- **Found during:** Task 2 — TypeScript compilation failed with `Property 'chatSession' does not exist on type 'PrismaClient'`
- **Issue:** This worktree branched from `f0cd0d6` before Plan 01-01 added the Prisma models
- **Fix:** Added ChatSession and ChatMessage models to prisma/schema.prisma, added `chatSession ChatSession?` relation to UserProfile, ran `npx prisma generate`
- **Files modified:** `prisma/schema.prisma`
- **Commit:** dfdf01a

**2. [Rule 3 - Blocking] Legal guardrail content missing from prompts.ts**
- **Found during:** Task 1 TDD — prompts.test.ts includes BUG-07 tests expecting guardrail content not present in this worktree
- **Issue:** BUG-07 fix was applied by Plan 01-03 worktree (worktree-agent-a828fb00) which hasn't merged to this branch
- **Fix:** Added the legal guardrail text inline alongside the AP warning to satisfy all test contracts
- **Files modified:** `src/lib/ai/prompts.ts`
- **Commit:** ddfaf59

## Known Stubs

None — all route logic is wired to real Prisma queries.

## Self-Check: PASSED

- `src/app/api/chat/history/route.ts` exists and exports GET
- `src/lib/ai/prompts.ts` contains ADVANCE PAROLE, I-485, I-131
- Commits ddfaf59 and dfdf01a confirmed in git log
- Both test files pass: 10/10 tests green

---
*Phase: 02-core-case-features*
*Completed: 2026-04-17*

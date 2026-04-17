---
phase: 02-core-case-features
plan: "08"
subsystem: ui
tags: [chat, ai-sdk, prisma, useChat, initialMessages, UIMessage]

# Dependency graph
requires:
  - phase: 02-core-case-features
    plan: "05"
    provides: ChatSession/ChatMessage models and GET /api/chat/history endpoint
provides:
  - Chat history loads immediately on documentation-filling page mount from server-fetched DB messages
  - initialMessages prop chain from page -> ChatUI -> ChatContainer -> useChat
affects: [documentation-filling, chat-ui, chat-container, CHAT-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component queries ChatSession/ChatMessage directly via Prisma (avoids internal API fetch anti-pattern)"
    - "DB messages converted from content:string to UIMessage parts:[{type:'text',text}] format before seeding useChat"
    - "Seed messages memoized with empty deps to prevent re-derivation on re-renders"

key-files:
  created: []
  modified:
    - src/app/documentation-filling/page.tsx
    - src/components/chat-ui.tsx
    - src/components/chat/chat-container.tsx

key-decisions:
  - "Direct Prisma query in Server Component instead of internal fetch to /api/chat/history (Next.js App Router anti-pattern)"
  - "DB messages converted to UIMessage parts format (not just content string) to satisfy @ai-sdk/react ChatInit type"
  - "seedMessages memoized with empty dependency array so initial DB messages only seed once on mount"

patterns-established:
  - "UIMessage hydration pattern: convert {id, role, content} -> {id, role, parts:[{type:'text',text:content}]}"

requirements-completed:
  - CHAT-04

# Metrics
duration: 15min
completed: 2026-04-17
---

# Phase 02 Plan 08: Chat History Wire-Up Summary

**Chat history from DB seeded as UIMessage[] into useChat on documentation-filling page mount, eliminating loading flash for returning users**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-17T22:30:00Z
- **Completed:** 2026-04-17T22:45:00Z
- **Tasks:** 2 of 2 (Task 2 human-verify approved — deferred to end of project)
- **Files modified:** 3

## Accomplishments
- `documentation-filling/page.tsx` queries `ChatSession` + `ChatMessage` directly via Prisma and passes `initialMessages` to ChatUI
- `chat-ui.tsx` accepts and forwards `initialMessages` prop to `ChatContainer`
- `chat-container.tsx` converts `{id, role, content}` DB records to `UIMessage` `parts` format and seeds `useChat({ messages: seedMessages })`
- TypeScript compiles cleanly across all 3 modified files

## Task Commits

1. **Task 1: Wire initialMessages fetch and prop chain** - `745a278` (feat)
2. **Task 2: Human verification checkpoint** - approved (deferred to end of project)

## Files Created/Modified
- `src/app/documentation-filling/page.tsx` - Added `getCurrentUserAndProfile` + Prisma ChatSession query; passes `initialMessages` to ChatUI
- `src/components/chat-ui.tsx` - Added `initialMessages` prop type and passthrough to ChatContainer
- `src/components/chat/chat-container.tsx` - Added `initialMessages` prop; memoized conversion to UIMessage parts; passed to `useChat({ messages: seedMessages })`

## Decisions Made
- Used direct Prisma query in Server Component rather than calling `/api/chat/history` internally — calling internal API routes from RSC is an anti-pattern in Next.js App Router
- Converted DB messages to `UIMessage` `parts` array format (`{ type: "text", text: content }`) because `useChat` from `@ai-sdk/react` uses `ChatInit.messages: UIMessage[]` not a legacy `{ role, content }[]` format
- Memoized `seedMessages` with empty dependency array to ensure DB history only seeds the chat once on initial mount

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used `messages` (not `initialMessages`) in useChat and converted to UIMessage format**
- **Found during:** Task 1
- **Issue:** Plan instructed passing `initialMessages` to `useChat({ ..., initialMessages })` but the `@ai-sdk/react` `ChatInit` interface uses `messages?: UI_MESSAGE[]` (not `initialMessages`). Additionally, `UI_MESSAGE` requires `parts` array, not plain `content` string.
- **Fix:** Memoized conversion of `initialMessages` prop to `UIMessage[]` format and passed as `messages: seedMessages` to `useChat`
- **Files modified:** src/components/chat/chat-container.tsx
- **Verification:** TypeScript compiles without errors on the changed files; grep confirms wiring
- **Committed in:** 745a278

---

**Total deviations:** 1 auto-fixed (Rule 1 - API shape mismatch)
**Impact on plan:** Required fix for TypeScript correctness and runtime correctness. No scope creep.

## Issues Encountered
- `@ai-sdk/react` v3 uses `ChatInit.messages` not `initialMessages` — plan's interface specification reflected legacy API shape. Auto-corrected.
- Pre-existing TypeScript error in `src/__tests__/lib/fee-schedule.test.ts` (missing FEES_2026 export) — out of scope, deferred.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CHAT-04 requirement fulfilled: returning users see chat history immediately on page load
- Task 2 (human-verify checkpoint) approved by user — deferred to end of project; user will verify chat history loads, AP travel warning fires, documents page, forms panel, and screener all work
- Phase 02 (Core Case Features) fully complete — all 8 plans executed

---
*Phase: 02-core-case-features*
*Completed: 2026-04-17*

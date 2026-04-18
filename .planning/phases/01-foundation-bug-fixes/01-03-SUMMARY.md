---
phase: 01-foundation-bug-fixes
plan: 03
subsystem: security,ui,forms,pdf
tags: [security, legal-guardrail, upl, mime-validation, edition-lock, pdf-cleanup]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [getMagicMime utility, legal guardrail in systemPrompt, UplDisclaimer component, edition locks in FormPack, loadingTask cleanup]
  affects: [upload route, chat AI, my-forms page, documentation-filling page, pdf-preview]
tech_stack:
  added: []
  patterns: [magic byte MIME detection, Server Component disclaimer, TDD red-green per task]
key_files:
  created:
    - src/lib/mime.ts
    - src/components/upl-disclaimer.tsx
    - src/__tests__/lib/mime-check.test.ts
    - src/__tests__/lib/prompts.test.ts
    - src/__tests__/lib/rate-limit.test.ts
    - src/__tests__/components/upl-disclaimer.test.tsx
    - src/__tests__/lib/form-packs.test.ts
    - src/__tests__/components/pdf-preview.test.tsx
  modified:
    - src/lib/ai/prompts.ts
    - src/app/api/dashboard/upload/route.ts
    - src/app/documentation-filling/page.tsx
    - src/app/dashboard/my-forms/page.tsx
    - src/lib/form-packs.ts
    - src/components/pdf-preview.tsx
    - src/lib/fee-schedule.ts
    - vitest.config.ts
decisions:
  - "UplDisclaimer placed on documentation-filling page (the real chat page) rather than /chat/page.tsx since /chat redirects to /documentation-filling"
  - "loadingTask typed as `any` to avoid pdfjs-dist PDFDocumentLoadingTask import complexity in useEffect scope"
  - "FEES_2026 barrel export added to fee-schedule.ts to satisfy pre-existing test (individual constants remain canonical)"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-17"
  tasks_completed: 2
  files_changed: 16
---

# Phase 01 Plan 03: Security Guardrails, UPL Disclaimer, Edition Locks, and PDF Cleanup Summary

Security guardrails (legal deflection in AI prompt, UPL disclaimer component), MIME magic byte validation for uploads, USCIS edition locks on all 6 form packs, and loadingTask resource cleanup in PDF preview.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Security guardrails, UPL disclaimer, MIME validation, fee hardcodes (BUG-06/07/08/11) | 3c5eb7b | mime.ts, prompts.ts, upl-disclaimer.tsx, upload/route.ts, docs-filling/page.tsx, my-forms/page.tsx + 4 test files |
| 2 | Edition locks, edition warning UI, PDF loadingTask cleanup (BUG-09, BUG-12) | 8665343 | form-packs.ts, my-forms/page.tsx, pdf-preview.tsx, fee-schedule.ts + 2 test files |

## What Was Built

**BUG-07 — Legal guardrail in systemPrompt:** Added an IMPORTANT Legal Boundaries block at the top of `systemPrompt` in `src/lib/ai/prompts.ts`. The block lists prohibited topics (eligibility assessment, criminal bars, legal strategy, outcome prediction) and instructs the model to respond with the deflection message containing "I can't provide legal advice on that" and to reference `uscis.gov`.

**BUG-08 — UPL Disclaimer component:** Created `src/components/upl-disclaimer.tsx` as a Server Component with `role="note"`. Wired to `src/app/dashboard/my-forms/page.tsx` (above the form pack grid) and `src/app/documentation-filling/page.tsx` (the actual chat page; `/chat/page.tsx` simply redirects there).

**BUG-11 — MIME magic byte validation:** Created `src/lib/mime.ts` with `getMagicMime(bytes: Uint8Array)` utility. Updated `src/app/api/dashboard/upload/route.ts` to import from `@/lib/mime`, read `arrayBuffer()` once (stream consumed once), check first 8 bytes, and reject requests where magic bytes don't match ALLOWED_TYPES. The validated buffer is passed to Supabase storage instead of the original File object.

**BUG-09 — Edition locks:** Added `editionDate: string` and `lockedUntil: Date` to the `FormPack` interface and all 6 pack entries in `FORM_PACKS`. Added an edition warning banner inside `PackCard` in `my-forms/page.tsx` that shows when `new Date() > pack.lockedUntil`.

**BUG-12 — PDF loadingTask cleanup:** Refactored the `useEffect` in `src/components/pdf-preview.tsx` to capture the `loadingTask` reference and call `loadingTask?.destroy().catch(() => {})` in the cleanup function. The critical `canvas` property in `page.render()` (required for pdfjs-dist v5) was preserved.

**BUG-06 (part 2) — Fee hardcodes:** No hardcoded `$675` or `$260` strings existed in the worktree's `my-case-timeline.tsx` or `timeline-checklists.ts` (the latter doesn't exist). The plan referenced strings that were not present in this code state. Documented as deviation.

## Test Results

- 8 test files, 38 tests — all passing
- TypeScript: `npx tsc --noEmit` exits 0

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed vitest.config.ts plugin import**
- **Found during:** Task 1 RED phase
- **Issue:** `vitest.config.ts` imported `@testing-library/react` as a Vite plugin, which is incorrect. Broke JSX transform for component tests.
- **Fix:** Changed import to `@vitejs/plugin-react` and added `plugins: [react()]` to config.
- **Files modified:** `vitest.config.ts`
- **Commit:** 3c5eb7b

**2. [Rule 1 - Bug] Added FEES_2026 barrel export to fee-schedule.ts**
- **Found during:** Task 2 full test suite run
- **Issue:** Pre-existing `src/__tests__/lib/fee-schedule.test.ts` imports `FEES_2026` as a grouped object, but `fee-schedule.ts` only exported individual constants. Per STATE.md key decisions, a barrel export was intended.
- **Fix:** Added `export const FEES_2026 = { ... } as const` grouping all 2026 fee constants. Individual named exports remain unchanged.
- **Files modified:** `src/lib/fee-schedule.ts`
- **Commit:** 8665343

### Scope Notes

**BUG-06 part 2 — Fee hardcode removal:** The plan referenced `src/lib/timeline-checklists.ts` (does not exist in this worktree) and hardcoded `$675`/`$260` in `src/components/my-case-timeline.tsx` (not present). Zero matches found — no action required. These hardcodes either never existed in this branch or were removed in a prior commit.

**UplDisclaimer placement:** The plan specified wiring to `/chat/page.tsx`. That page does nothing but `redirect("/documentation-filling")`. The UplDisclaimer was placed on `documentation-filling/page.tsx` instead — the actual page users see when navigating to chat.

## Self-Check: PASSED

- src/lib/mime.ts: FOUND
- src/components/upl-disclaimer.tsx: FOUND
- src/__tests__/lib/mime-check.test.ts: FOUND
- Commit 3c5eb7b: FOUND
- Commit 8665343: FOUND

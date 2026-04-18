---
phase: 1
slug: foundation-bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.1 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-T1 | 01 | 1 | BUG-06 | unit | `npm test -- --run src/__tests__/lib/fee-schedule.test.ts` | ✅ | ⬜ pending |
| 1-02-T1 | 02 | 2 | BUG-01/02/TIME-01-05 | integration | `npm test -- --run src/__tests__/lib/timeline-persistence.test.ts src/__tests__/lib/form-persistence.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-T2 | 02 | 2 | BUG-03/04/05/10/13 | integration | `npm test -- --run src/__tests__/lib/chat-persistence.test.ts` | ❌ W0 | ⬜ pending |
| 1-03-T1 | 03 | 3 | BUG-06/07/08/11 | unit | `npm test -- --run src/__tests__/lib/mime-check.test.ts src/__tests__/lib/prompts.test.ts src/__tests__/components/upl-disclaimer.test.tsx` | ❌ W0 | ⬜ pending |
| 1-03-T2 | 03 | 3 | BUG-09/12 | unit | `npm test -- --run src/__tests__/lib/form-packs.test.ts src/__tests__/components/pdf-preview.test.tsx` | ❌ W0 | ⬜ pending |
| 1-04-T1 | 04 | 2 | AUTH-01/02 | unit | `npm test -- --run src/__tests__/components/auth-form.test.tsx` | ❌ W0 | ⬜ pending |
| 1-04-T2 | 04 | 2 | AUTH-04/05 | unit | `npm test -- --run src/__tests__/app/invite-accept.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Test files that must be created (by plan tasks) before their verify commands can run:

- [ ] `src/__tests__/lib/timeline-persistence.test.ts` — stubs for BUG-01, BUG-02 (created in Plan 02, Task 1)
- [ ] `src/__tests__/lib/form-persistence.test.ts` — stubs for BUG-02 (created in Plan 02, Task 1)
- [ ] `src/__tests__/lib/chat-persistence.test.ts` — stubs for BUG-03/04/05 (created in Plan 02, Task 2)
- [ ] `src/__tests__/lib/mime-check.test.ts` — imports getMagicMime from @/lib/mime (created in Plan 03, Task 1)
- [ ] `src/__tests__/lib/prompts.test.ts` — tests for BUG-07 (created in Plan 03, Task 1)
- [ ] `src/__tests__/lib/rate-limit.test.ts` — documents BUG-10 key format (created in Plan 03, Task 1)
- [ ] `src/__tests__/lib/form-packs.test.ts` — tests for BUG-09 (created in Plan 03, Task 2)
- [ ] `src/__tests__/components/upl-disclaimer.test.tsx` — tests for BUG-08 (created in Plan 03, Task 1)
- [ ] `src/__tests__/components/pdf-preview.test.tsx` — stub for BUG-12 (created in Plan 03, Task 2)
- [ ] `src/__tests__/components/auth-form.test.tsx` — tests for AUTH-01/02 (created in Plan 04, Task 1)
- [ ] `src/__tests__/app/invite-accept.test.tsx` — tests for AUTH-04/05 (created in Plan 04, Task 2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Spouse invite email delivery | AUTH-04 | Requires live email send via Supabase | Send invite from petitioner account; check inbox for magic link |
| Google OAuth sign-in | AUTH-02 | Requires live OAuth provider | Click "Sign in with Google"; confirm redirect and session cookie |
| Vercel cold start file survival | BUG-03, BUG-12, BUG-13 | Requires Vercel deployment | Upload file, trigger cold start, confirm file accessible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

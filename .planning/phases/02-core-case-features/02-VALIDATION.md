---
phase: 2
slug: core-case-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^4.1.1 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-screener-ewi | TBD | 1 | CASE-01, CASE-02 | unit | `npm run test -- --run src/__tests__/screener` | ❌ W0 | ⬜ pending |
| 2-screener-timeline | TBD | 1 | CASE-03 | unit | `npm run test -- --run src/__tests__/timeline` | ❌ W0 | ⬜ pending |
| 2-document-model | TBD | 1 | DOC-01 | unit | `npm run test -- --run src/__tests__/document` | ❌ W0 | ⬜ pending |
| 2-document-upload | TBD | 1 | DOC-02, DOC-03 | integration | `npm run test -- --run src/__tests__/document-upload` | ❌ W0 | ⬜ pending |
| 2-document-download | TBD | 1 | DOC-04 | unit | `npm run test -- --run src/__tests__/document-download` | ❌ W0 | ⬜ pending |
| 2-document-delete | TBD | 1 | DOC-05 | unit | `npm run test -- --run src/__tests__/document-delete` | ❌ W0 | ⬜ pending |
| 2-forms-data | TBD | 1 | FORM-01, FORM-02 | unit | `npm run test -- --run src/__tests__/form-packs` | ❌ W0 | ⬜ pending |
| 2-forms-edition | TBD | 1 | FORM-03 | unit | `npm run test -- --run src/__tests__/form-edition` | ❌ W0 | ⬜ pending |
| 2-chat-history | TBD | 2 | CHAT-04 | unit | `npm run test -- --run src/__tests__/chat-history` | ❌ W0 | ⬜ pending |
| 2-chat-extract | TBD | 2 | CHAT-05 | unit | `npm run test -- --run src/__tests__/chat-extract` | ❌ W0 | ⬜ pending |
| 2-chat-warning | TBD | 2 | CHAT-06 | unit | `npm run test -- --run src/__tests__/chat-warning` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/screener.test.tsx` — stubs for CASE-01, CASE-02 (EWI warning display logic)
- [ ] `src/__tests__/timeline.test.ts` — stubs for CASE-03 (entry-type filter in timeline-checklists)
- [ ] `src/__tests__/document.test.ts` — stubs for DOC-01 (Document model creation/retrieval)
- [ ] `src/__tests__/document-upload.test.ts` — stubs for DOC-02, DOC-03 (upload API + tag)
- [ ] `src/__tests__/document-download.test.ts` — stubs for DOC-04 (signed URL generation, access control)
- [ ] `src/__tests__/document-delete.test.ts` — stubs for DOC-05 (delete API, ownership check)
- [ ] `src/__tests__/form-packs.test.ts` — stubs for FORM-01, FORM-02 (FORM_PACKS data completeness)
- [ ] `src/__tests__/form-edition.test.ts` — stubs for FORM-03 (edition warning logic)
- [ ] `src/__tests__/chat-history.test.ts` — stubs for CHAT-04 (GET /api/chat/history)
- [ ] `src/__tests__/chat-extract.test.ts` — stubs for CHAT-05 (field extraction + profile save)
- [ ] `src/__tests__/chat-warning.test.ts` — stubs for CHAT-06 (AP travel warning in prompt)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Screener completes and shows correct AOS eligibility result | CASE-01 | Requires browser + Supabase session | Log in, open screener, complete all 7 steps, verify result page shows correct status |
| EWI warning banner visible on dashboard after screener | CASE-02 | Requires live session state | Complete screener with EWI entry type, navigate to dashboard, verify amber banner shown |
| Forms panel edition warning shows amber banner | FORM-03 | Requires browser rendering | Open any form with outdated edition flag, verify amber banner with edition text |
| USCIS download link opens correct URL | FORM-04 | External URL verification | Click "Download from USCIS.gov" for I-130, verify correct USCIS URL opens in new tab |
| Document upload accepts PDF/JPG and shows in list | DOC-02 | File system + Supabase Storage | Upload a test PDF, verify it appears in document list with correct filename |
| Document download returns file via signed URL | DOC-04 | Supabase Storage signed URL | Click download on uploaded document, verify file downloads correctly |
| Chat history persists after page navigation | CHAT-04 | Browser session state | Send chat message, navigate away, return to chat, verify previous messages shown |
| AI extracts data from document and populates profile | CHAT-05, DOC-01 | AI inference + DB write | Upload passport, trigger extract, verify name/DOB fields populated in case profile |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

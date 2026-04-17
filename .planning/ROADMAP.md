# PaperPair Roadmap

**4 phases** | **51 v1 requirements** | Coarse granularity

---

## Phases

- [x] **Phase 1: Foundation & Bug Fixes** — Stabilize the existing app: fix all P0 bugs, lock in DB persistence, auth flows, and timeline tracking (completed 2026-04-17)
- [ ] **Phase 2: Core Case Features** — Deliver the full guided experience: case setup, forms browser, AI chat, and document management
- [ ] **Phase 3: Completion Tools** — Guide the user to the finish line: income calculator and submission packet assembly
- [ ] **Phase 4: Interview Prep** — Prepare both spouses for the USCIS interview

---

## Phase Details

### Phase 1: Foundation & Bug Fixes
**Goal**: The existing app is reliable — state persists to the database, security guardrails are in place, and auth works end-to-end including spouse invites
**Depends on**: Nothing (first phase)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06, BUG-07, BUG-08, BUG-09, BUG-10, BUG-11, BUG-12, BUG-13, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, TIME-01, TIME-02, TIME-03, TIME-04, TIME-05
**Success Criteria** (what must be TRUE):
  1. A user can check off timeline items, close the browser, reopen on a different device, and see their exact progress unchanged
  2. A user can sign up with email/password, sign in with Google, and stay signed in across page refreshes
  3. The petitioner can invite their spouse by email; the spouse accepts the link and sees the shared case with their role-appropriate write access
  4. Every chat, form, and screener page displays the UPL disclaimer, and the AI refuses to answer eligibility or legal questions
  5. Uploaded files, generated PDFs, and selected forms survive a Vercel cold start (persisted to Supabase Storage / database, not in-memory or ephemeral disk)
**Plans**: 6 plans (4 original + 2 gap closure)
Plans:
- [x] 01-01-PLAN.md — Schema foundation: ChatSession/ChatMessage models + FEES_2026 barrel export
- [x] 01-02-PLAN.md — DB persistence migrations: timeline, forms, chat, PDF storage, abortSignal, rate limiter upgrade
- [x] 01-03-PLAN.md — Security guardrails: legal guardrail, UPL disclaimer, edition locks, MIME check, PDF cleanup
- [x] 01-04-PLAN.md — Auth + spouse invite acceptance page
- [x] 01-05-PLAN.md — Gap closure: replace hardcoded fee amounts in timeline-checklists.ts and my-case-timeline.tsx (BUG-06)
- [ ] 01-06-PLAN.md — Gap closure: UplDisclaimer on /dashboard screener page (BUG-08) + REQUIREMENTS.md corrections (AUTH-03, BUG-10)
**UI hint**: yes

### Phase 2: Core Case Features
**Goal**: Users can set up their case, explore all required forms with guidance, chat with the AI assistant about their case, and upload supporting documents
**Depends on**: Phase 1
**Requirements**: CASE-01, CASE-02, CASE-03, CASE-04, FORM-01, FORM-02, FORM-03, FORM-04, CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, DOC-01, DOC-02, DOC-03, DOC-04, DOC-05
**Success Criteria** (what must be TRUE):
  1. A new user completes the eligibility screener and is told clearly whether AOS applies to them, with timeline steps adjusted for their entry type
  2. A user can browse all 6 required AOS forms, read plain-English instructions, see an edition warning if the form may be outdated, and click through to the official USCIS download page
  3. A user can chat with the AI assistant, have it collect their names, dates, and addresses conversationally, and see that data saved automatically to their case profile — with chat history intact after navigating away
  4. A user can upload a passport or marriage certificate, tag it by document type, and later download it via a signed URL — with access blocked to anyone else
  5. Data extracted by the AI from uploaded documents is auto-populated into the correct form fields
**Plans**: 8 plans
Plans:
- [x] 02-01-PLAN.md — Wave 0 test scaffolds for all Phase 2 requirements (RED state)
- [x] 02-02-PLAN.md — Document Prisma model + schema migration + document-types.ts utility
- [x] 02-03-PLAN.md — Forms enrichment: FormPack type extension + pack detail instructions + edition warning banner
- [x] 02-04-PLAN.md — Screener wiring: save-on-complete + EWI warning + timeline entry-type filter
- [x] 02-05-PLAN.md — Chat history API (GET /api/chat/history) + AP travel warning in systemPrompt
- [x] 02-06-PLAN.md — Documents page + upload extension + GET/DELETE /api/documents
- [x] 02-07-PLAN.md — Document AI extraction route + Extract to profile button wire-up
- [ ] 02-08-PLAN.md — Chat initialMessages wire-up + human verification checkpoint
**UI hint**: yes

### Phase 3: Completion Tools
**Goal**: Users can verify their income qualifies for sponsorship and assemble their complete submission packet
**Depends on**: Phase 2
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, SUB-01, SUB-02, SUB-03, SUB-04
**Success Criteria** (what must be TRUE):
  1. A user enters their household size and petitioner income; the calculator immediately shows the 125% poverty threshold and tells them whether they qualify or need a joint sponsor
  2. If income is insufficient, the calculator explains joint sponsor requirements clearly
  3. A user can download all filled PDF forms as a single submission package
  4. A submission checklist walks the user through packet assembly and mailing, with the correct USCIS lockbox address linked (never hardcoded) and a prominent Advance Parole travel warning shown before they submit
**Plans**: TBD

### Phase 4: Interview Prep
**Goal**: Both spouses feel prepared and organized for their USCIS interview
**Depends on**: Phase 3
**Requirements**: INT-01, INT-02, INT-03, INT-04
**Success Criteria** (what must be TRUE):
  1. A user can browse the full bank of common USCIS interview questions organized by category (relationship, personal history, forms)
  2. Both spouses can access a what-to-bring checklist for interview day
  3. Both spouses can read interview tips specific to their role
**Plans**: TBD
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Bug Fixes | 5/6 | In Progress|  |
| 2. Core Case Features | 7/8 | In Progress|  |
| 3. Completion Tools | 0/? | Not started | - |
| 4. Interview Prep | 0/? | Not started | - |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 1 | Pending |
| BUG-02 | Phase 1 | Pending |
| BUG-03 | Phase 1 | Pending |
| BUG-04 | Phase 1 | Pending |
| BUG-05 | Phase 1 | Pending |
| BUG-06 | Phase 1 | Pending |
| BUG-07 | Phase 1 | Pending |
| BUG-08 | Phase 1 | Pending |
| BUG-09 | Phase 1 | Pending |
| BUG-10 | Phase 1 | Pending |
| BUG-11 | Phase 1 | Pending |
| BUG-12 | Phase 1 | Pending |
| BUG-13 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| TIME-01 | Phase 1 | Pending |
| TIME-02 | Phase 1 | Pending |
| TIME-03 | Phase 1 | Pending |
| TIME-04 | Phase 1 | Pending |
| TIME-05 | Phase 1 | Pending |
| CASE-01 | Phase 2 | Pending |
| CASE-02 | Phase 2 | Pending |
| CASE-03 | Phase 2 | Pending |
| CASE-04 | Phase 2 | Pending |
| FORM-01 | Phase 2 | Pending |
| FORM-02 | Phase 2 | Pending |
| FORM-03 | Phase 2 | Pending |
| FORM-04 | Phase 2 | Pending |
| CHAT-01 | Phase 2 | Pending |
| CHAT-02 | Phase 2 | Pending |
| CHAT-03 | Phase 2 | Pending |
| CHAT-04 | Phase 2 | Pending |
| CHAT-05 | Phase 2 | Pending |
| CHAT-06 | Phase 2 | Pending |
| DOC-01 | Phase 2 | Pending |
| DOC-02 | Phase 2 | Pending |
| DOC-03 | Phase 2 | Pending |
| DOC-04 | Phase 2 | Pending |
| DOC-05 | Phase 2 | Pending |
| CALC-01 | Phase 3 | Pending |
| CALC-02 | Phase 3 | Pending |
| CALC-03 | Phase 3 | Pending |
| CALC-04 | Phase 3 | Pending |
| SUB-01 | Phase 3 | Pending |
| SUB-02 | Phase 3 | Pending |
| SUB-03 | Phase 3 | Pending |
| SUB-04 | Phase 3 | Pending |
| INT-01 | Phase 4 | Pending |
| INT-02 | Phase 4 | Pending |
| INT-03 | Phase 4 | Pending |
| INT-04 | Phase 4 | Pending |

**Coverage:** 51/51 v1 requirements mapped ✓

---

*Roadmap created: 2026-04-17*
*Phase 1 planned: 2026-04-17 — 4 plans, 2 execution waves*
*Phase 1 gap closure: 2026-04-17 — 2 additional plans (01-05, 01-06) for 4 verification gaps*
*Phase 2 planned: 2026-04-17 — 8 plans, 2 execution waves*

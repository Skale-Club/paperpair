# Requirements: PaperPair

**Defined:** 2026-04-17
**Core Value:** The applicant always knows exactly what to do next — no confusion, no missed steps, no wasted trips to the USCIS website.

---

## v1 Requirements

### Bug Fixes (P0 — must ship before any new feature)

- [x] **BUG-01**: Timeline checklist progress persisted to database (not localStorage)
- [x] **BUG-02**: My Forms selection persisted to database (not localStorage)
- [x] **BUG-03**: Generated PDFs stored in Supabase Storage (not ephemeral Vercel disk)
- [x] **BUG-04**: Chat messages persisted across navigation (ChatSession + ChatMessage tables)
- [x] **BUG-05**: AI extraction results saved back to CaseStep (wizard ↔ chat in sync)
- [x] **BUG-06**: Fee inconsistency resolved — single source of truth from `fee-schedule.ts`
- [x] **BUG-07**: AI legal guardrail added — LLM deflects eligibility/legal questions
- [x] **BUG-08**: UPL disclaimer displayed on all form, chat, and screener pages
- [x] **BUG-09**: Edition locks added for all 6 forms (I-130, I-130A, I-131, I-765, I-864, I-864A)
- [x] **BUG-10**: Rate limiter upgraded to user-ID keyed in-memory (Upstash Redis deferred to Phase 2 per D-07)
- [x] **BUG-11**: File upload MIME type validated server-side (magic byte check)
- [x] **BUG-12**: PDF viewer loadingTask.destroy() called on component unmount
- [x] **BUG-13**: abortSignal passed to streamText to cancel on client disconnect

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can sign in with Google OAuth
- [x] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: Petitioner can invite beneficiary spouse via email link
- [x] **AUTH-05**: Invited spouse can accept invite and access shared case

### Case Setup

- [x] **CASE-01**: User completes initial eligibility screener to determine if AOS applies
- [x] **CASE-02**: Timeline steps shown/hidden based on entry type (lawful entry, overstay, EWI)
- [x] **CASE-03**: Case status fields stored on profile (receipt numbers, priority date, case status)
- [ ] **CASE-04**: Petitioner has write access to their own steps (I-130, spouse-info, marriage-details)

### Timeline & Checklist

- [x] **TIME-01**: User can view the full 19-section AOS timeline
- [x] **TIME-02**: User can check/uncheck individual checklist items within each section
- [x] **TIME-03**: Section auto-completes when all items are checked
- [x] **TIME-04**: Overall progress bar reflects completed sections
- [x] **TIME-05**: Timeline progress persists to database across devices

### Forms

- [ ] **FORM-01**: User can browse all 6 required AOS forms with PDF previews
- [x] **FORM-02**: Each form shows plain-English instructions and what to expect
- [x] **FORM-03**: User is warned if a form edition may be outdated
- [x] **FORM-04**: Forms page links directly to official USCIS download pages

### AI Chat

- [ ] **CHAT-01**: User can chat with AI assistant about their case
- [ ] **CHAT-02**: AI assistant performs conversational intake (collects names, dates, addresses)
- [ ] **CHAT-03**: Extracted data is saved to the user's CaseStep profile automatically
- [x] **CHAT-04**: Chat history persists across navigation and sessions
- [ ] **CHAT-05**: AI deflects legal questions and includes UPL disclaimer in responses
- [x] **CHAT-06**: AI warns against traveling without Advance Parole when topic arises

### Documents

- [x] **DOC-01**: User can upload supporting documents (passport, marriage cert, bank statements, etc.)
- [x] **DOC-02**: Uploaded documents are tagged by type (passport, birth certificate, marriage certificate, etc.)
- [ ] **DOC-03**: Documents are stored privately in Supabase Storage with per-user access control
- [ ] **DOC-04**: User can view and download their uploaded documents via signed URLs
- [x] **DOC-05**: Uploaded documents can be used to auto-populate form fields via AI extraction

### I-864 Income Calculator

- [ ] **CALC-01**: User enters household size and petitioner's annual income
- [ ] **CALC-02**: Calculator displays 125% federal poverty guideline threshold for that household size
- [ ] **CALC-03**: Calculator tells user if income qualifies or if a joint sponsor is needed
- [ ] **CALC-04**: Calculator explains joint sponsor requirements if income is insufficient

### Submission

- [ ] **SUB-01**: User can download their filled PDF forms as a complete package
- [ ] **SUB-02**: Submission checklist guides user through packet assembly and mailing
- [ ] **SUB-03**: Correct USCIS lockbox address displayed (never hardcoded — links to USCIS.gov)
- [ ] **SUB-04**: Advance Parole travel warning shown prominently before submission

### Interview Prep

- [ ] **INT-01**: User can access a bank of common USCIS interview questions
- [ ] **INT-02**: Questions are organized by category (relationship, personal history, forms)
- [ ] **INT-03**: What-to-bring checklist for the interview day
- [ ] **INT-04**: Interview tips for both spouses

---

## v2 Requirements

### Differentiation

- **DIFF-01**: Evidence strength meter — grades bona fide marriage evidence (Weak / Medium / Strong)
- **DIFF-02**: Cross-form consistency checker — flags contradictions across forms before submission
- **DIFF-03**: RFE response assistant — guides user through responding to a Request for Evidence

### Post-Submission Tracking

- **POST-01**: Case status tracker — plain-English decoder for myUSCIS status codes
- **POST-02**: Processing time display — current USCIS processing times for the user's field office
- **POST-03**: I-693 expiry calculator — warns if medical exam will expire before interview
- **POST-04**: I-751 removal of conditions reminder — calendar reminder for conditional green card holders

### Growth

- **GROW-01**: Spanish language support
- **GROW-02**: Attorney review layer — flag case for licensed attorney review
- **GROW-03**: Push/email notifications for case status changes
- **GROW-04**: GDPR/CCPA data deletion flow

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| K-1 fiancé visa | AOS only for v1 — different forms and process |
| Consular processing | Different track entirely; adds major complexity |
| DACA renewal | Different population and forms |
| Attorney case management portal | B2B product; different business model |
| Real-time USCIS status API | No public API; would require scraping |
| Mobile native app | Web-first; mobile PWA sufficient |
| Guaranteed outcomes or legal advice | UPL risk; out of scope by design |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 to BUG-13 | Phase 1 | Pending |
| AUTH-01 to AUTH-05 | Phase 1 | Pending |
| CASE-01 to CASE-04 | Phase 2 | Pending |
| TIME-01 to TIME-05 | Phase 1 | Pending |
| FORM-01 to FORM-04 | Phase 2 | Pending |
| CHAT-01 to CHAT-06 | Phase 2 | Pending |
| DOC-01 to DOC-05 | Phase 2 | Pending |
| CALC-01 to CALC-04 | Phase 3 | Pending |
| SUB-01 to SUB-04 | Phase 3 | Pending |
| INT-01 to INT-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-17 after initial definition*

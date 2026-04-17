# Research: Pitfalls & Risks
_Researched: 2026-04-17_

---

## Legal / Compliance Risks

### Unauthorized Practice of Law (UPL)
**Severity: CRITICAL**

Immigration is a federal practice area. Under 8 CFR 292.1, only licensed attorneys and accredited representatives may provide "legal advice" in immigration matters. Self-help tools occupy a narrow safe harbor: they may provide legal information (explaining what forms exist and what questions they ask) but must not provide legal advice (applying law to a specific person's facts and recommending a course of action).

**Key risks:**
- The AI chat currently asks for case facts (prior removal orders, criminal history, unlawful presence) and could be interpreted as analyzing eligibility — which crosses into advice territory if it recommends "you are eligible."
- Generating a pre-filled I-485 based on user data may be construed as practicing law if combined with implicit eligibility guidance.
- Several states (e.g., California, Texas, New York) have their own UPL statutes with criminal penalties, not just bar rules.
- The Federal Trade Commission and state AGs have pursued immigration document preparers aggressively under consumer protection laws.

**What is permissible:**
- Providing checklists, fee schedules, and links to official USCIS instructions.
- Helping users fill in form fields they self-identify — the user directs the work.
- Explicitly stating: "This tool is not a lawyer and does not provide legal advice."

**Required safeguards:**
- Prominent, persistent UPL disclaimer on every page that touches form data or eligibility discussion.
- The AI prompt must never assert eligibility ("you qualify") — it must say "based on what you told me, the typical requirement is X; consult an attorney if you have any complications."
- Terms of Service must include a clear disclaimer, limitation of liability, and a recommendation to consult a licensed attorney for complex cases.
- In states that regulate "immigration consultants" separately (California BPC 22440+), an additional disclosure or registration may be required.

### Data Accuracy Liability
If a user submits an incorrectly filled form based on PaperPair's guidance and is harmed (application rejected, detention, removal proceedings), there is a potential civil liability exposure. A limitation-of-liability clause in the TOS is necessary but not sufficient — courts sometimes refuse to enforce broad liability waivers in consumer-facing contexts where the user had no meaningful bargaining power.

**Mitigation:** The disclaimer must be conspicuous (not buried in fine print). Users should be prompted to review every field before downloading/submitting.

---

## Technical Pitfalls

### PDF Rendering — Browser Compatibility
**Severity: HIGH**

The codebase uses `pdfjs-dist` v5 for in-browser PDF rendering. Known issues:

- `pdfjs-dist` v5 changed the render API: `render()` now requires a `canvas` property in the render parameters (already fixed per commit history, but must not regress).
- The worker file (`pdf.worker.min.js`) must be served from the same origin or a CDN. Cross-origin worker loading triggers CORS errors in Firefox and Safari on strict policies.
- On Vercel, static assets in `/public` are edge-cached. If a form PDF is replaced (new USCIS edition), Vercel's CDN may serve the stale version for hours. The CDN `Cache-Control` header must include versioning or a purge strategy.

### PDF Generation — Server-Side (pdf-lib)
**Severity: HIGH**

- `pdf-lib` fills AcroForm fields by name. USCIS form field names change between editions without announcement. If the underlying template is updated but field names differ, `fillPdfTemplate` silently skips mismatched fields (by design, per current `try/catch`). The user gets a partially filled PDF with no error.
- USCIS official PDFs use digital signatures and security restrictions. `pdf-lib` may not preserve these, producing a file that Adobe Reader flags as modified/invalid.
- The `lockFormEdition()` guard in `pdf.ts` only validates one form (I-485 edition "01/20/25"). Other forms (I-130, I-765, I-131, I-864) have no edition lock — a stale template can be silently used.
- Generated PDFs are written to `private/generated/` on the filesystem. On Vercel serverless functions, the filesystem is ephemeral — files are lost between invocations. This path is not safe for production; Supabase Storage or S3 is required.

### Rate Limiting — In-Memory Store
**Severity: MEDIUM**

The current rate limiter (`rate-limit.ts`) uses a `globalThis` in-memory Map. On serverless deployments (Vercel), each cold start gets a fresh Map — the rate limit resets per instance, per cold start. An attacker can bypass the limit by simply hitting different serverless instances. A Redis-backed rate limiter (Upstash Redis is the standard Vercel-compatible choice) is required for production.

### File Upload — MIME Type Spoofing
**Severity: MEDIUM**

The upload route checks `file.type` (the MIME type the browser reports), which is trivially spoofable. A malicious file with a `.pdf` extension and `application/pdf` MIME type but containing executable or malicious content could be uploaded. Server-side magic byte validation (first 5 bytes of a PDF start with `%PDF-`) is missing.

### CORS and Supabase Storage Signed URLs
If user-uploaded documents are ever served via Supabase Storage public or signed URLs, the `Access-Control-Allow-Origin` header on the bucket must be configured. By default, Supabase Storage buckets have permissive CORS for browser access, but the `user-documents` bucket is private — generating signed URLs server-side and proxying through the Next.js API (as currently done) avoids CORS entirely and is the correct approach.

### localStorage for Form State
**Severity: MEDIUM**

`form-packs.ts` stores pending/sent form state in `localStorage`. This data survives tab closes but is device-local and not synced. If a user switches devices mid-flow, they lose their progress. More critically, localStorage is accessible to any same-origin JavaScript — an XSS vulnerability anywhere on the domain can exfiltrate this data. For sensitive immigration form state, server-persisted state (already used for `CaseStep`) is safer.

---

## Immigration-Specific Accuracy Risks

### Outdated Form Editions
**Severity: CRITICAL**

USCIS rejects applications submitted on outdated form editions, with no refund of filing fees. Edition dates appear at the bottom-left of every USCIS form. USCIS can and does update editions with 30 days or less notice.

- Current risk: Only the I-485 has an edition lock (`VALID_I485_EDITION = "01/20/25"`). I-130, I-131, I-765, I-864, and I-864A have no automated edition check.
- The static PDFs in `/public/forms/` have no automated refresh mechanism. A form edition change requires a manual deployment.
- Mitigation: Implement edition locks for all forms. Add a USCIS form edition monitor (a scheduled job that fetches the USCIS forms page and compares edition dates, alerting the team on change).

### Fee Schedule Changes
**Severity: HIGH**

USCIS fee changes require a rulemaking process but have historically occurred with 60–90 days notice. The `fee-schedule.ts` file hardcodes 2026 fees. If USCIS changes fees mid-year (as happened in 2024), users will see incorrect fee amounts, potentially underpaying and triggering rejection.

- The checklist currently shows I-130 filing fee as "$675" (step `i130-9`) while `fee-schedule.ts` defines `FEES_2026_I130_PAPER = 535`. These are inconsistent — a concrete current bug.
- Mitigation: Single-source all fee display from `fee-schedule.ts`. Consider a versioning and expiry mechanism for the fee schedule with an admin override.

### USCIS Mailing Address Changes
**Severity: HIGH**

USCIS lockbox addresses change when they redistribute workload across service centers. Using the wrong mailing address causes rejection and return of the entire packet — often weeks later. The checklist currently points users to uscis.gov to confirm their state's address (correct approach), but the app does not dynamically validate this.

- Risk: Any static mailing address displayed in the app becomes a liability the moment USCIS changes it.
- Mitigation: Never hard-code USCIS mailing addresses. Always instruct users to verify at uscis.gov/forms/filing-your-form/direct-filing-addresses immediately before mailing.

### I-94 Record Discrepancies
The app collects the I-94 number from user input but does not validate it against the CBP I-94 database (which is publicly queryable). A typo in the I-94 number is a common cause of RFE (Request for Evidence). The app should prompt users to copy-paste the number directly from cbp.dhs.gov rather than typing it from memory.

### Medical Exam Validity Window
Form I-693 has a specific validity window: the Civil Surgeon's signature is valid for 2 years, and the medical exam must be submitted within that window. The app notes this in `interview-prep` checklist (`int-prep-7`) but does not calculate or alert the user based on their actual exam date.

### Advance Parole Travel Risk (CRITICAL USER RISK)
The checklist (`ead-5`, `ead-6`) correctly states not to travel without the AP document. However, the app does not have a hard warning or block if a user asks about traveling before AP is received. AI chat responses on this topic must be accurate — traveling without Advance Parole while AOS is pending results in automatic abandonment of the I-485 application (with narrow exceptions for certain parole categories). A wrong answer here is irreversible.

---

## UX / Trust Risks

### Premature Confidence
**Severity: HIGH**

Users who complete PaperPair's checklist may believe their application is complete and correct. The checklist provides excellent coverage of the standard case but cannot account for:
- Prior removal orders (bars to adjustment)
- Unlawful presence bars (3/10-year bars)
- Prior visa fraud
- Certain criminal convictions
- Previous petitions or applications
- Conditional bars for certain entry categories (parole, VWP)

The eligibility checklist (`determine-eligibility`) asks about some of these but relies on user self-assessment. A user who does not understand what "removal order" means may check "no" incorrectly.

**Mitigation:** After eligibility self-check, display a plain-language explanation of each item. Add a final "consult an attorney if any of the above applies" screen before proceeding to form generation.

### Deadline Awareness
AOS processing times fluctuate widely (6 months to 3+ years). The app does not currently surface:
- The I-693 2-year expiry clock starting from exam date
- The I-94 expiry date (the user is in a period of authorized stay, but overstay before filing is disqualifying)
- RFE response deadlines (87 days, non-extendable)
- I-751 filing window for conditional residents (90 days before 2-year card expires)

Missing a deadline in the immigration context can result in unlawful presence accumulation, automatic abandonment of a case, or having to restart the entire process.

### AI Hallucination on Legal Questions
**Severity: CRITICAL**

The current chat system uses `gemini-2.0-flash` with a low temperature (0.3) for the intake flow. For factual legal questions about immigration, LLMs can hallucinate specific rules, dates, exceptions, and procedures with high confidence. Users may ask questions outside the structured intake flow (e.g., "What happens if I was out of status for 3 months?") and receive plausible but incorrect answers.

**Mitigation:**
- Scope the AI strictly to data intake. Questions outside the intake flow should be deflected with: "I can help you fill out your forms, but for questions about your eligibility or legal situation, please consult a licensed immigration attorney."
- Add a system prompt instruction to never answer substantive legal questions.
- The current `systemPrompt` does not include this guardrail — this is a current gap.

### Language Accessibility
A significant proportion of marriage-based AOS applicants are non-native English speakers. The app has translation infrastructure (`src/lib/translations.ts`) but if translations are incomplete or machine-generated without legal review, a translated instruction could be misleading. Legal form instructions should only be presented in languages reviewed by a qualified translator.

---

## Data Privacy & Security

### PII Sensitivity
**Severity: HIGH**

Data collected by PaperPair is among the most sensitive possible: full legal name, date of birth, home address, phone, email, I-94 number, marriage date, and entry date. This data, if breached, could enable identity theft and immigration fraud. It is also subject to specific legal protections.

### AI Key Storage
The app encrypts user-supplied Google API keys at rest using AES-256-GCM (`secret-crypto.ts`) — this is correctly implemented. However, the keys are used in transit to call Google's Gemini API directly from the server, meaning the plaintext key passes through server memory. This is acceptable but should be audited to ensure the key is never logged.

### Conversation Transcripts in Database
Chat messages (including all PII the user typed) are stored in the database (`prisma.chat` or similar). This creates a high-value target. Considerations:
- Are chat messages encrypted at rest at the database level? (Supabase encrypts at the storage layer, but not field-level.)
- Is there a retention policy? Conversations containing PII should be deletable by the user.
- GDPR/CCPA: If any EU or California residents use the app, data deletion rights apply. The app needs a data deletion flow.

### Generated PDF Files — Ephemeral Storage Risk
Generated PDFs in `private/generated/` contain fully filled immigration forms with all PII. On Vercel, this directory is ephemeral, which means:
1. The files disappear on cold start — users who do not immediately download their PDFs lose them.
2. If files persist between requests (warm instances), one user's PDF could theoretically be read by another user's request if the filename check fails.

The per-user filename prefix (`${userId}-...`) and the `filename.startsWith(context.user.id)` check in the PDF download route are the only access controls — and they are fragile (dependent on correct filename format).

**Recommendation:** Move generated PDFs to Supabase Storage under a per-user private path with signed URLs. Delete from filesystem after serving.

### Supabase Row-Level Security
The `user-documents` bucket stores sensitive uploaded documents. RLS policies must enforce that only the owning user can read their own files. This must be audited — Supabase Storage RLS is separate from database RLS and easy to misconfigure (a misconfigured bucket policy can make all uploaded documents publicly accessible by URL).

### No Audit Log
There is no audit trail for who accessed what data, when. In an immigration context (where government access requests are possible), an audit log is both a security best practice and potentially legally significant.

---

## Performance & Scaling

### PDF Generation — Synchronous, Blocking, Disk-Bound
`generatePdfs()` in the chat route is synchronous, disk-bound, and runs inside a serverless function. Each call reads one or more template PDFs from disk and writes output to disk. On Vercel:
- Serverless function timeout is 10 seconds (Hobby) or 60 seconds (Pro) — sufficient for a few small PDFs but not for batch generation.
- Disk I/O in serverless is significantly slower than local development.
- Concurrent PDF generation for many users will exhaust serverless concurrency limits.

**Recommendation:** Move PDF generation to a queue-backed background job (e.g., Trigger.dev or Inngest), store results in Supabase Storage, and return a job ID to the client that polls for completion.

### In-Memory Rate Limiter — Not Horizontally Scalable
As noted under Technical Pitfalls, the current rate limiter is instance-local. Under load, with multiple serverless instances, the effective rate limit is `max * number_of_instances`. Replace with Upstash Redis.

### Civil Surgeon Locator — External API Dependency
`src/app/api/civil-surgeons/route.ts` likely calls an external USCIS or third-party API for civil surgeon locations. If that API is down or rate-limited, the entire civil surgeon feature fails. This should have a cached fallback.

### Large Document Uploads — No Streaming
The upload route reads the entire file into memory via `formData()` before sending it to Supabase Storage. A 10 MB PDF (the maximum) is fine for now, but if limits are ever raised, this becomes a memory pressure issue. Supabase Storage supports multipart uploads for large files.

### No CDN Cache Invalidation Strategy for Form PDFs
Static form PDFs in `/public/forms/` are served via Vercel's CDN. When a form edition changes and the team deploys a new PDF, Vercel invalidates the cache on deployment. However, if the filename is the same (e.g., `i130-petition.pdf`), browsers with aggressive caching may serve the old version until their local cache expires. Use content-addressable filenames (e.g., hash in filename) or set aggressive `Cache-Control: no-cache` headers for form PDFs.

---

## Mitigation Recommendations

- Add a persistent, prominent UPL disclaimer on every form-related page, the chat interface, and the dashboard; do not bury it in the footer.
- Restrict the AI system prompt to strictly data intake; add an explicit instruction to deflect legal questions and never assert eligibility.
- Implement edition locks for all six form types (I-130, I-130A, I-131, I-485, I-765, I-864/A) matching the pattern already used for I-485.
- Reconcile the fee schedule: the I-130 checklist shows $675 while `fee-schedule.ts` defines $535 — pick one source of truth and use it everywhere.
- Replace the in-memory rate limiter with Upstash Redis for multi-instance correctness.
- Move generated PDFs from ephemeral local filesystem to Supabase Storage with per-user private paths and short-lived signed URLs; delete after serving.
- Add server-side magic byte validation for uploaded files to complement MIME type checking.
- Audit Supabase Storage RLS policies for the `user-documents` bucket to ensure no files are publicly accessible.
- Add a data deletion flow (GDPR/CCPA) allowing users to delete their account, chat history, and uploaded documents.
- Never hard-code USCIS mailing addresses in user-facing content; always direct users to verify at uscis.gov before mailing.
- Surface time-sensitive deadlines to the user: I-693 exam expiry, RFE response windows, I-751 filing window.
- Display a hard warning in the chat and dashboard if the user indicates they are considering travel while AOS is pending without Advance Parole in hand.
- Add a USCIS form edition monitoring job (scheduled, weekly) that scrapes the USCIS forms page and alerts the team when an edition date changes.
- Move PDF generation to a background job queue (Trigger.dev or Inngest) to avoid serverless timeout and ephemeral filesystem issues.
- Implement field-level or row-level encryption for chat messages and form data stored in the database, or at minimum document the Supabase encryption baseline and data retention policy.

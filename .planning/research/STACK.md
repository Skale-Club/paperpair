# Research: Stack & Architecture Patterns
_Researched: 2026-04-17_
_Confidence: HIGH — all findings verified against the actual codebase_

---

## Progress Persistence

### What the codebase already does (correct pattern)

PaperPair already uses the right architecture: canonical progress state lives in **Postgres via Prisma** (`CaseStep` table), not in localStorage.

```
CaseStep
  userProfileId  String            -- scoped per user
  stepSlug       String            -- "personal-info", "documents", etc.
  status         StepStatus        -- NOT_STARTED | IN_PROGRESS | COMPLETED
  data           Json              -- arbitrary key/value bag for step answers
  completedAt    DateTime?
  @@unique([userProfileId, stepSlug])
```

The API route (`/api/dashboard/steps`) does an **upsert** on every write — idempotent, race-safe, always in sync across devices.

### Observed gap: localStorage leaking into critical paths

`src/lib/form-packs.ts` uses localStorage exclusively for three keys:

- `pp_pending_forms` — which form IDs are selected but not yet "sent"
- `pp_visited_packs` — which form pack cards have been opened
- `pp_my_forms` — forms the user has "sent" to themselves

These are session-scoped UI hints (acceptable for ephemeral selection state), but `sendForms()` treats `pp_my_forms` as the source of truth for "My Forms" — meaning if the user clears their browser or switches devices, the list is gone.

There is also a one-off pattern in `initial-screener.tsx`:
```ts
localStorage.setItem("case_type", answers.entryType ?? "");
localStorage.setItem("screener_done", "true");
```
These are redundant signals that duplicate what the DB already encodes. Not harmful, but adds drift risk.

### Recommendation

**Rule:** Use Postgres/Supabase (via Prisma) as the single source of truth for any progress, preference, or selection that needs to survive a browser session. Use localStorage only for:
1. Transient in-flight UI state (e.g., "which accordion is expanded right now")
2. Client-side perf hints that can be safely re-derived from the DB

Migrate `pp_my_forms` (the persisted "My Forms" list) into a `UserFormSelection` Prisma model or into the `CaseStep.data` JSON of the `documents` step. The `pp_pending_forms` in-session selection can stay in React state (no need for localStorage at all — it does not need to survive a page refresh).

---

## PDF Handling

### What the codebase already does

Two complementary PDF approaches coexist:

**1. pdfjs-dist v5 (read/render)**
- Used in `PdfPreview` (blurred card thumbnails) and `PdfViewer` (full interactive browser with overlay inputs)
- Worker is served from `/public/pdf.worker.min.mjs` — correct pattern for Next.js App Router (avoids Webpack bundling the worker)
- Dynamic import (`await import("pdfjs-dist")`) avoids SSR issues
- Canvas render with `{ canvasContext, viewport, canvas }` matches the v5 API (the extra `canvas` property in render params was a required fix for pdfjs-dist v5)
- Annotation extraction via `page.getAnnotations()` drives the interactive overlay inputs — a sound pattern for read-only form previewing

**2. pdf-lib (write/fill)**
- Used in `src/lib/pdf.ts` for server-side form filling
- Loads a PDF, iterates AcroForm text fields, sets values, flattens, saves
- `sanitizeField()` fills optional empty fields with "N/A" — correct for USCIS (blank optional fields can trigger rejections)
- Edition locking (`lockFormEdition`) enforces a specific I-485 form edition date — important because USCIS rejects outdated editions

### Known pitfalls with pdfjs-dist in Next.js

| Pitfall | Status in this codebase |
|---------|------------------------|
| Worker path breaks with Webpack bundling | Avoided — worker served from `/public` as static file |
| SSR crash (pdfjs uses browser APIs) | Avoided — dynamic import inside `useEffect` |
| pdfjs v5 render API changed (requires `canvas` param) | Already fixed (commit history notes this) |
| Large PDFs slow first render | Mitigated by per-page streaming render loop |
| Multiple PDF loads not cancelled on unmount | Partially mitigated — `cancelled` flag pattern used, but `loadingTask` is not explicitly destroyed on cancel |

### Recommendation

- Do not replace pdfjs-dist with react-pdf. `react-pdf` wraps pdfjs and adds React overhead with no benefit for this use case. Direct pdfjs-dist gives finer control over annotations and canvas, which is necessary for the interactive overlay pattern.
- Do not use `<iframe>` for PDF display. Browsers differ wildly in iframe PDF rendering; no annotation access is possible from an iframe.
- Fix the incomplete cancel pattern: call `loadingTask.destroy()` in the cleanup function so that in-flight network requests are actually aborted, not just ignored.
- Consider lazy-loading pages (render only pages in viewport) for long forms like I-485 (20+ pages) to avoid blocking the main thread.

---

## Guided Workflow Patterns

### What the codebase already does

PaperPair uses a **flat step registry + server-rendered status** pattern:

- Steps are defined statically in `DASHBOARD_STEPS` (ordered array of slugs)
- Status per step is `NOT_STARTED | IN_PROGRESS | COMPLETED` (stored in DB)
- The dashboard page renders all steps with status badges — no client-side state machine

The `InitialScreener` component uses a **local integer step counter** (`useState(0)`) as a mini wizard inside a modal. This is the canonical React pattern for small, self-contained linear wizards that do not need back/forward browser navigation.

### Patterns used by immigration/legal SaaS apps

**Pattern 1: Linear checklist with per-step status (used here — correct)**
Best for AOS which has a fixed, ordered process. Each step is a route or a section; status is persisted per step. Progress bar derived from step statuses.

**Pattern 2: Conditional branching based on case profile**
AOS has real branches: EWI applicants have different requirements than visa overstays. The codebase captures `entryType` in the DB but does not yet use it to conditionally show/hide steps or checklist items. This is the next natural improvement.

**Pattern 3: State machine for multi-step forms (XState / Zod-validated transitions)**
Overkill for the current scope. Appropriate if the workflow has complex guards, parallel states, or needs to be tested in isolation. Not recommended here — the flat array + DB status approach is simpler and sufficient.

**Pattern 4: URL-based step navigation**
Each step is a discrete route (`/dashboard/personal-info`, `/dashboard/spouse-info`, etc.). The codebase already does this. This is preferable to a query-param wizard for deep-linking and browser history support.

### Recommendation

- Keep the flat step registry + DB status approach for the main AOS checklist.
- Add conditional step visibility: filter `DASHBOARD_STEPS` at render time based on `caseStep.data.entryType`. EWI applicants do not file I-765 in the same way; visa overstay applicants may not need certain waivers.
- The `InitialScreener` local-state wizard pattern is correct and should not be changed to a state machine.
- Do not add a multi-step wizard library (Formik wizard, react-step-wizard, etc.) — they add complexity without matching benefit for this domain.

---

## AI Document Assistance

### What the codebase already does

The chat system (`/api/chat`) follows a structured data extraction pattern:

1. Vercel AI SDK `streamText` drives the conversational turn
2. In parallel, the system extracts structured fields from the conversation (Google Gemini structured output, fallback to regex heuristic)
3. Extracted data feeds into `fillPdfTemplate` (pdf-lib) to generate filled PDFs on demand
4. The system prompt lists missing fields and asks the AI to collect the next one

This is correct for immigration intake. The approach is:
- **AI for conversation** (warm, guided, multi-turn)
- **Deterministic extraction** for structured data (not AI-guessing from free text mid-stream)
- **Template fill** as the output artifact

### Patterns used in legal/immigration AI apps

**Pattern 1: Field-by-field conversational intake (used here)**
Ask one question at a time, confirm the answer, advance to next field. Reduces cognitive load. Works well on mobile. Risk: users want to dump all info at once — the system must gracefully handle bulk input.

**Pattern 2: Document upload + extraction**
User uploads a passport, I-94, or marriage certificate. OCR + LLM extracts fields. Maps extracted values into form fields. Requires server-side OCR (Tesseract, Google Vision, or Mistral vision model). Not yet implemented in PaperPair.

**Pattern 3: AI review / error detection**
After all fields are collected, a final AI pass checks for logical inconsistencies (e.g., marriage date after I-94 entry date, name mismatch across documents). Output is a list of warnings before PDF generation. Not yet implemented.

**Pattern 4: AI as a "second lawyer" — guidance, not form-fill**
Conversational Q&A about eligibility, timelines, what to expect at the interview. Separate from the intake flow. The current `systemPrompt` mixes guidance with data intake, which can confuse users.

### Recommendation

- Split the system prompt into two modes: **intake mode** (collect missing fields, one at a time) and **guidance mode** (answer questions, explain next steps). Switch based on whether all required fields are collected.
- Add document upload + OCR extraction as a future capability. Use Mistral vision or Google Vision API to extract passport/I-94 fields. This is the highest-value improvement to the AI layer.
- Add a pre-generation validation pass: after all fields are collected, run a structured check (Zod + deterministic rules) before calling `fillPdfTemplate`. Never rely on the LLM to validate form data.
- The heuristic extraction (`parseHeuristic`) is fragile. The Google structured output path (`extractWithGoogle`) is more reliable — ensure admin keys are always configured so the heuristic is only a last resort.

---

## Vercel AI SDK Pitfalls

### What the codebase uses

- `ai` v6.0.137 with `@ai-sdk/react` v3.0.139
- `streamText` on the server with `result.toUIMessageStreamResponse()`
- `useChat` with `DefaultChatTransport` on the client
- `UIMessage` format (parts array, not `content` string)

### Known pitfalls with Vercel AI SDK in Next.js App Router

**Pitfall 1: Mixed UIMessage / legacy message formats**
The codebase has a `convertUIMessagesToLegacy` function and `extractTextFromMessage` adapter in the API route. This indicates the chat route was originally written for the older `content: string` message format and later adapted to `parts`. The adapters work but are a maintenance liability — any new consumer of the message history must know which format it receives.

**Recommendation:** Standardize on the UIMessage/parts format everywhere. Remove the legacy adapter functions once all consumers (extraction, prompt building) read from `parts` directly.

**Pitfall 2: Streaming response + JSON side-channel conflict**
The route returns either a streaming `UIMessageStreamResponse` (for normal chat) or a plain `Response` with JSON (for the PDF-generation branch). This means the client `useChat` hook will receive a non-stream response for the PDF case and may not handle it gracefully. The `generatedFiles` state in `ChatContainer` is never actually populated from the API response — there is no path in the client code that parses the JSON from the PDF branch.

**Recommendation:** Use the Vercel AI SDK `streamText` tool-calling mechanism (`tools` parameter) for PDF generation instead of a side-channel JSON response. Define a `generatePdf` tool and let the SDK handle the result in the stream. This is the designed pattern for side effects in AI SDK v4+.

**Pitfall 3: No message persistence**
The `useChat` hook holds messages in component state only. If the user navigates away or refreshes, the conversation is lost. For an immigration intake flow where partial data must survive, this is a usability gap.

**Recommendation:** Persist the conversation to the `CaseStep.data` JSON for the relevant step (e.g., `immigration-info`), or implement a `ChatSession` DB model. On mount, re-hydrate the `useChat` messages from the DB. The AI SDK `useChat` accepts an `initialMessages` prop for this.

**Pitfall 4: Rate limiting is IP-based, not user-based**
The current rate limiter (`runRateLimit`) uses client IP. In serverless/Vercel environments with edge middleware, the IP may be the Vercel edge proxy IP, causing all users behind the same proxy to share one rate limit bucket.

**Recommendation:** Rate-limit by `userProfile.id` (from the authenticated session) for authenticated endpoints. Fall back to IP only for unauthenticated routes.

**Pitfall 5: `streamText` temperature 0.3 with Gemini Flash**
Gemini 2.0 Flash at temperature 0.3 is appropriate for structured extraction but may produce overly terse responses in guidance mode. Consider temperature 0.7 for free-form guidance and 0.1 for structured intake.

**Pitfall 6: No `abortSignal` passed to `streamText`**
If the client disconnects mid-stream, the server continues generating tokens and consuming API quota. Pass `request.signal` to `streamText`:
```ts
const result = streamText({
  model,
  system: fullSystemPrompt,
  messages: modelMessages,
  abortSignal: request.signal,  // add this
  temperature: 0.3,
});
```

---

## Key Recommendations

- **DB is the source of truth.** Migrate `pp_my_forms` (localStorage) into the `CaseStep` or a new `UserFormSelection` Prisma model. Remove the `screener_done` / `case_type` localStorage writes; the DB already encodes this.
- **Fix the PDF cancel pattern.** Call `loadingTask.destroy()` in `useEffect` cleanup to abort in-flight pdfjs network requests on unmount.
- **Pass `abortSignal: request.signal` to `streamText`.** Prevents wasted API calls when the client disconnects.
- **Use AI SDK tool-calling for PDF generation.** Replace the JSON side-channel response with a `generatePdf` tool defined in `streamText`; the SDK routes the result into the stream correctly.
- **Persist chat messages to the DB.** Hydrate `useChat` with `initialMessages` from the relevant `CaseStep.data` so partial intake survives navigation.
- **Rate-limit by user ID, not IP.** Authenticated endpoints should key the rate limiter on `userProfile.id`.
- **Split the system prompt** into intake mode (collect missing fields) and guidance mode (answer questions). Switch modes based on whether all required fields are present.
- **Do not replace pdfjs-dist** with react-pdf or iframe. The current direct pdfjs approach is correct and gives annotation access needed for the interactive overlay.
- **Add conditional step visibility** based on `entryType`. EWI and overstay applicants have meaningfully different form requirements that should be reflected in which steps are surfaced.
- **Add a pre-generation validation pass** (deterministic Zod rules) before calling `fillPdfTemplate`. Never trust the LLM to validate legal data.

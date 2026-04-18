# Research: Architecture & Data Model
_Researched: 2026-04-17_
_Based on: full codebase audit of existing Prisma schema, Supabase migrations, route handlers, and components_

---

## Case Data Model

### What exists today

The current schema uses a single flat `CaseStep` table as the entire case data layer. There is no explicit `Case` entity. One `UserProfile` IS effectively one case.

```prisma
model UserProfile {
  id            String   @id @default(cuid())
  authId        String   @unique   // Supabase auth.users.id
  email         String   @unique
  fullName      String?
  avatarUrl     String?
  role          Role     @default(USER)
  tier          String   @default("free")
  viewerOfId    String?            // spouse viewer link
  viewerOf      UserProfile?  @relation("SpouseViewer", ...)
  viewers       UserProfile[] @relation("SpouseViewer")
  caseSteps     CaseStep[]
  spouseInvites SpouseInvite[]
}

model CaseStep {
  id            String     @id @default(cuid())
  userProfileId String
  stepSlug      String     // "personal-info" | "spouse-info" | "marriage-details" | "immigration-info" | "documents" | "review"
  stepOrder     Int
  status        StepStatus // NOT_STARTED | IN_PROGRESS | COMPLETED
  data          Json       // freeform: form answers + file metadata
  completedAt   DateTime?
  notes         String?
  @@unique([userProfileId, stepSlug])
}
```

The 6 canonical step slugs are defined in `src/lib/dashboard-steps.ts` — not derived from the DB. This is intentional: step definitions are code; progress state is data.

### What is missing / needs to be added

**A formal `Case` entity is not needed for v1.** The one-user-one-case constraint holds for AOS (each couple files one AOS case). Adding a `Case` table now adds complexity without benefit. Instead, extend `UserProfile` with AOS-specific fields.

**Recommended additions to the existing flat model:**

```prisma
model UserProfile {
  // ... existing fields ...

  // AOS case metadata (add via migration)
  filingBasis        String?   // "married-to-usc" | "lpr-spouse"
  entryType          String?   // "lawful-entry" | "overstay" | "ewi"
  priorityDate       DateTime? // i-130 receipt date — establishes place in line
  receiptNumbers     Json?     // { i130: "IOE...", i485: "IOE...", i765: "IOE...", i131: "IOE..." }
  beneficiaryDob     DateTime?
  beneficiaryCountry String?
  marriageDate       DateTime?
  caseStatus         String?   // "pre-filing" | "pending" | "biometrics" | "interview-scheduled" | "approved"
}
```

**Separate petitioner/beneficiary data lives in `CaseStep.data` JSON blobs:**
- `personal-info` step data = beneficiary info
- `spouse-info` step data = petitioner info
- `marriage-details` step data = marriage facts
- `immigration-info` step data = entry history

This is the correct separation: step-level form data in the JSON blob, case-level metadata on `UserProfile`.

**AOS-specific data model sketch (logical, not all new tables):**

```
UserProfile (one per user)
  ├── caseStatus, filingBasis, entryType, priorityDate
  ├── receiptNumbers (JSON)
  └── CaseStep[] (one row per step slug)
        └── data (JSON): form answers for that step
              personal-info:   { fullName, dob, email, phone, address, ... }
              spouse-info:     { spouseFullName, spouseEmail, citizenshipProof, ... }
              marriage-details: { marriageDate, location, priorMarriages, ... }
              immigration-info: { i94Number, entryDate, visaClass, portOfEntry, ... }
              documents:       { files: [{ name, path, uploadedAt, docType }] }
              review:          { confirmedAt, notes }
```

---

## Checklist Persistence

### What exists today

The **timeline checklist** (19 sections, 150+ checkbox items) is CURRENTLY localStorage-only. This is a known gap flagged in `PROJECT.md`:

> "Progress persistence: Currently localStorage-based (no DB persistence yet for timeline state)"

The **dashboard 6-step wizard** persists to `CaseStep` in PostgreSQL via `/api/dashboard/steps` PATCH.

### How to move timeline checklist to Postgres

The checklist items are statically defined in `src/lib/timeline-checklists.ts` (keyed by section slug). Only the checked/unchecked state needs to persist.

**Option A (recommended): Use the existing `CaseStep` table with one row per section.**

```
CaseStep row:
  stepSlug  = "checklist:gather-documents"
  status    = IN_PROGRESS | COMPLETED
  data      = { checked: ["doc-1", "doc-3", "doc-7"] }
```

The `checked` array contains only the IDs of checked items; unchecked items are implied absent. This is compact and avoids a sparse 150-row table.

Slugs follow a `checklist:{sectionId}` convention to avoid collision with the 6 dashboard step slugs.

**Option B: Separate `ChecklistProgress` table.**

```prisma
model ChecklistProgress {
  id            String   @id @default(cuid())
  userProfileId String
  sectionSlug   String   // "gather-documents"
  checkedItems  String[] // PostgreSQL native array: ["doc-1", "doc-3"]
  updatedAt     DateTime @updatedAt
  @@unique([userProfileId, sectionSlug])
}
```

Cleaner separation, but requires a migration and a new API route. Use this if checklist data grows complex (notes per item, timestamps).

**Recommendation: Start with Option A** (reuse `CaseStep`). It works with the existing `/api/dashboard/steps` PATCH endpoint immediately. Migrate to a dedicated table if checklist items need richer data (notes, individual timestamps).

**Phase grouping for progress display:**

The 4 phases and 19 sections are defined in the `PHASES` constant in `my-case-timeline.tsx`. A phase is `COMPLETED` when all its sections are completed. A section is `COMPLETED` when all its checklist items are checked. Derive phase progress in the application layer from section state — do not store phase-level completion separately.

---

## Document Storage

### What exists today

Supabase Storage bucket `user-documents` is private (not public). RLS enforces per-user isolation at the storage level:

```sql
-- Path convention: {authId}/{stepSlug}/{timestamp}-{filename}
-- RLS policies restrict all operations to the authenticated user's own folder.
```

The upload route (`/api/dashboard/upload`) enforces:
- Auth check (Supabase session)
- File type allowlist: `application/pdf`, `image/jpeg`, `image/png`
- Size limit: 10 MB
- Path: `{userId}/{stepSlug}/{Date.now()}-{sanitizedFilename}`

After upload, file metadata is appended to `CaseStep.data.files` as:

```ts
{ name: string; path: string; uploadedAt: string }
```

### What is missing

1. **Document type classification.** The current metadata has no `docType` field. Every uploaded file is generic. Future features (document checklist status, AI review of specific doc types) need to know what a file is.

2. **Signed URLs for downloads.** The dashboard currently shows `file.path` (the storage path) but there is no download link. Files cannot be accessed directly (private bucket). Signed URLs must be generated server-side.

3. **Spouse viewer access to documents.** Current storage RLS uses `auth.uid()` — the viewer spouse cannot read the primary user's documents via direct Supabase access. Files must be served via a signed API route that checks the viewer relationship in Prisma.

### Recommended patterns

**Signed URL generation (for file access):**

```ts
// In an API route, after verifying viewer/owner access:
const { data } = await supabaseAdmin.storage
  .from("user-documents")
  .createSignedUrl(storagePath, 300); // 5-minute expiry
return NextResponse.json({ url: data.signedUrl });
```

Never generate signed URLs on the client. Always go through a server route that re-validates auth.

**Document metadata extension (add `docType` field):**

```ts
// Extend the UploadedFile type
type UploadedFile = {
  name: string;
  path: string;
  uploadedAt: string;
  docType?: string; // "passport" | "i94" | "birth-certificate" | "marriage-certificate" | ...
};
```

Pass `docType` from the upload form. This enables AI to verify the correct document was uploaded and enables the evidence checklist to track which required docs are satisfied.

**Storage path convention — maintain exactly as-is:**

```
user-documents/{authId}/{stepSlug}/{timestamp}-{filename}
```

This is already implemented and works well. Do NOT change it; it's the basis for RLS policies.

**Viewer access pattern for documents:**

```ts
// In /api/dashboard/documents/[id]/signed-url/route.ts
const context = await getCurrentUserAndProfileWithViewerSupport();
const ownerId = context.isViewer
  ? context.primaryProfile.userProfile.authId
  : context.user.id;
// Then generate signed URL using ownerId-prefixed path
```

---

## Form Data Collection

### What exists today

Form data is collected in two modes:

**Mode 1: Structured wizard steps** (dashboard 6-step flow)
- Each step has a typed list of `Field[]` objects (`{ name, label, type, placeholder, required }`)
- `DashboardStepForm` component auto-saves to `CaseStep.data` as a flat `Record<string, string>` on debounce
- Step definitions are code (`dashboard-steps.ts`); field definitions are passed as props per page

**Mode 2: AI chat extraction** (`/api/chat`)
- AI conversation collects 9 specific fields: `fullName`, `dateOfBirth`, `email`, `phone`, `currentAddress`, `spouseFullName`, `marriageDate`, `entryDateUsa`, `i94Number`
- Extraction uses Gemini JSON mode or heuristic fallback
- Extracted data is stateless (not persisted between chat sessions)

### What is missing

The two data collection modes are **disconnected**. Data entered in the wizard does not pre-fill the chat context; data extracted by the AI is not saved to the wizard steps. This is the largest data model gap.

### Recommended pattern: Single source of truth via `CaseStep.data`

**Profile data resolution order (for form pre-filling):**

```
1. CaseStep.data for the relevant step slug  (freshest, user-confirmed)
2. UserProfile fields (email, fullName)
3. Empty string fallback
```

**Chat context pre-loading:**

When the user opens the chat, the system prompt should include already-confirmed step data:

```ts
// Assemble context from CaseStep records for the system prompt
const personalInfo = asStepData(steps.find(s => s.stepSlug === "personal-info")?.data);
const immigrationInfo = asStepData(steps.find(s => s.stepSlug === "immigration-info")?.data);
const dataContext = buildDataContext({ personalInfo, immigrationInfo });
```

**AI extraction → step persistence:**

After AI extracts structured data, save it back to the appropriate `CaseStep`:

```ts
// /api/chat/route.ts — after extraction
if (extractedData.fullName || extractedData.dateOfBirth) {
  await prisma.caseStep.upsert({
    where: { userProfileId_stepSlug: { userProfileId, stepSlug: "personal-info" } },
    create: { userProfileId, stepSlug: "personal-info", data: JSON.stringify(extractedData) },
    update: { data: JSON.stringify({ ...existingData, ...extractedData }) },
  });
}
```

**Form field → USCIS form field mapping (future):**

For PDF auto-fill, a mapping layer is needed:

```ts
const FIELD_MAP: Record<string, Record<string, string>> = {
  "i130": {
    "beneficiary_full_name": "personal-info.fullName",
    "beneficiary_dob": "personal-info.dateOfBirth",
    "petitioner_name": "spouse-info.spouseFullName",
    // ...
  },
};
```

This mapping drives auto-population of PDF form fields from `CaseStep.data` without duplicating data.

---

## Chat History

### What exists today

Chat history is **ephemeral — stored only in the browser** via the Vercel AI SDK `useChat` hook. No chat messages are persisted to the database. Each page reload starts a fresh conversation.

The `/api/chat` route receives the full message array on every request (standard AI SDK pattern) and extracts structured data from it, but does not save the messages.

### What is needed

For continuity (user closes browser, comes back, sees prior conversation), chat history needs persistence.

**Recommended schema:**

```prisma
model ChatSession {
  id            String    @id @default(cuid())
  userProfileId String
  title         String?   // AI-generated short title (already have `titlePrompt`)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  messages      ChatMessage[]

  userProfile   UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id          String      @id @default(cuid())
  sessionId   String
  role        String      // "user" | "assistant" | "system"
  content     String      // text content
  parts       Json?       // optional: raw UIMessage parts (for multi-modal future)
  createdAt   DateTime    @default(now())

  session     ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

**Key design decisions:**

- One `ChatSession` per conversation thread. A user can have many sessions (sidebar shows session list).
- `content` stores plain text (sufficient for current use). `parts` stores full AI SDK UIMessage parts for future multi-modal support.
- `ChatMessage.role` is a plain string (not enum) to accommodate future AI SDK role additions without a migration.
- Messages are append-only; never update or delete individual messages.

**API changes required:**

```
POST   /api/chat/sessions          — create a new session, return sessionId
GET    /api/chat/sessions          — list sessions for current user
GET    /api/chat/sessions/[id]     — load messages for a session
POST   /api/chat                   — existing route, add sessionId to body; persist messages after stream completes
```

**Streaming + persistence pattern:**

```ts
// In /api/chat route, after stream completes:
const result = streamText({ ... });

// Persist user message immediately
await prisma.chatMessage.create({ data: { sessionId, role: "user", content: lastUserMessage } });

// Persist assistant message in onFinish callback
result.onFinish(async ({ text }) => {
  await prisma.chatMessage.create({ data: { sessionId, role: "assistant", content: text } });
});

return result.toUIMessageStreamResponse();
```

**Context injection from case data:**

The system prompt should always include the current case data snapshot so the AI has full context regardless of chat session history:

```
System: You are a PaperPair immigration assistant. Current case data: {snapshot}
```

This avoids relying on conversation history for factual case data — case data comes from `CaseStep`, not from chat history.

---

## Multi-User Case Access

### What exists today

The spouse viewer model is already implemented:

```
Primary user (petitioner or beneficiary who signed up first)
  └── UserProfile.id = "primary-id"

Viewer spouse (invited via /api/invite/spouse)
  └── UserProfile.viewerOfId = "primary-id"
```

Invite flow:
1. Primary user POSTs to `/api/invite/spouse` with `{ spouseEmail, spouseName }`
2. Prisma creates `SpouseInvite` (7-day token, one per primary user)
3. Supabase Admin sends magic-link email with `invite_token` in redirect URL
4. Spouse clicks, hits `/auth/callback`, their `UserProfile.viewerOfId` is set

Access function `getCurrentUserAndProfileWithViewerSupport()` already handles this:
- If `viewerOfId` is set: fetch primary user's profile and case steps
- Return `{ isViewer: true, primaryProfile }`

### What is missing and recommended

**1. RLS for viewer access (Supabase direct access)**

Current RLS on `CaseStep` only allows access via `auth.uid() == userProfile.authId`. A viewer querying via Supabase JS client (not Prisma service role) cannot read the primary user's data. Since all mutations go through Prisma (service role), this is not currently a bug — but it means the viewer pattern only works via server-side code.

For robustness, add an RLS policy for viewers:

```sql
-- Viewers may read the primary user's case steps
CREATE POLICY "Viewers read primary user case steps"
ON "CaseStep" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "UserProfile" viewer
    JOIN "UserProfile" primary_user ON primary_user.id = viewer."viewerOfId"
    WHERE viewer."authId" = auth.uid()::text
      AND primary_user.id = "CaseStep"."userProfileId"
  )
);
```

**2. Write access for viewers**

Currently the viewer model is read-only by convention (no explicit enforcement). For full collaboration (e.g., petitioner fills in petitioner's I-864 data), the viewer needs write access to specific steps.

Recommendation: Allow viewer writes to steps they "own" conceptually:
- Beneficiary (primary user): writes `personal-info`, `immigration-info`, `documents`, `review`
- Petitioner (viewer): writes `spouse-info`, `marriage-details`

Enforce this at the API layer (not storage layer):

```ts
// In /api/dashboard/steps PATCH
const PETITIONER_STEPS = new Set(["spouse-info", "marriage-details"]);
if (context.isViewer && !PETITIONER_STEPS.has(stepSlug)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
// Write to primaryProfile's case step, not viewer's own profile
const targetProfileId = context.isViewer
  ? context.primaryProfile.id
  : context.userProfile.id;
```

**3. Storage access for viewers**

The `user-documents` bucket path uses `{authId}` as the first path segment, and RLS enforces `auth.uid() == path[0]`. A viewer cannot access the primary user's files directly.

Resolution: Use signed URLs generated server-side via the admin client, after verifying viewer permission in Prisma. Do not attempt to make viewers access the bucket directly.

**4. One invite per couple (enforced)**

`SpouseInvite` has `@@unique primaryUserId` — only one active invite per primary user. This is correct. Do not change it. If the spouse needs to be re-invited, the existing invite is overwritten.

**5. Circular invite prevention**

If a viewer user tries to invite someone, they should be blocked (a viewer cannot become a primary user for a second case). Add this guard:

```ts
if (userProfile.viewerOfId) {
  return NextResponse.json({ error: "Viewers cannot send invites" }, { status: 403 });
}
```

This is not currently enforced but should be.

---

## Key Recommendations

- Do not add a `Case` entity for v1. The one-user-one-case AOS constraint makes `UserProfile` the case. Add AOS-specific columns (`filingBasis`, `caseStatus`, `receiptNumbers`, `priorityDate`) to `UserProfile` via a migration instead.

- Move timeline checklist persistence from localStorage to `CaseStep` using the `checklist:{sectionId}` slug convention. Reuse the existing PATCH endpoint. No new table needed until checklist data requires richer metadata (per-item notes or timestamps).

- Add `docType` to the `UploadedFile` metadata type so documents can be matched against required checklist items. This is a non-breaking change to the JSON schema.

- Never serve Supabase Storage files via direct signed URLs from the client. All file access must go through a server route (`/api/dashboard/documents/[id]/signed-url`) that re-validates auth and viewer permissions.

- Connect the AI chat to `CaseStep` data in both directions: pre-load confirmed step data into the system prompt so the AI knows what is already collected; save AI-extracted fields back to the relevant step after confirmation.

- Add `ChatSession` and `ChatMessage` tables for conversation persistence. Use the Vercel AI SDK `onFinish` callback to persist the assistant's response after the stream completes. The existing `titlePrompt` in `src/lib/ai/prompts.ts` is already suitable for generating session titles.

- Extend the viewer write model to allow the petitioner (viewer) to write to `spouse-info` and `marriage-details` steps. Block viewers from writing to beneficiary steps. Enforce this at the API route layer, not the database layer.

- Add an explicit guard in `/api/invite/spouse` to reject invitations sent by a user who is already a viewer (`userProfile.viewerOfId !== null`). This prevents a viewer from creating a second couple's case.

- All signed URL generation and viewer access resolution must use the Supabase admin client (service role), not the user-scoped client. The user-scoped client is correctly limited to the authenticated user's own data.

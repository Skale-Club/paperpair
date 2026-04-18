# Phase 4: Interview Prep - Research

**Researched:** 2026-04-17
**Domain:** Next.js 15 App Router — dashboard page refactor, hardcoded data constants, client-side interactive state
**Confidence:** HIGH (all findings from direct source-code inspection; no external tools required)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Refactor `/dashboard/interview/page.tsx` — do NOT rewrite from scratch. The flashcard flip interaction and section structure (questions, checklist, tips) are retained. Fix conventions: convert to Server Component shell + client widget, replace indigo/slate colors with project palette (`text-zinc-*`, `--color-warning-*`, olive/navy accent where appropriate), add `export const dynamic = "force-dynamic"`.
- **D-02:** Move all interactive state (flashcard flip, checklist) into a single `"use client"` component: `src/app/dashboard/interview/interview-client.tsx`. The server page reads the user role and passes it as a prop.
- **D-03:** Expand the question bank to approximately 28–32 questions across 4 USCIS categories: (1) Relationship History, (2) Daily Life & Cohabitation, (3) Personal & Immigration History, (4) Forms & Documents.
- **D-04:** Questions defined as a hardcoded constant in the client component. Each question has: `id`, `category`, `question`, `answerTip`.
- **D-05:** Category filter tabs above the question grid. "All" tab shows all questions. Active tab styled with project olive accent.
- **D-06:** Tips section has two sub-sections: "For the Petitioner (U.S. Citizen)" and "For the Beneficiary (Immigrant Spouse)". Server Component reads `userProfile.role` and passes it as a prop. Client highlights the user's own section.
- **D-07:** Each role section has 4–5 tips. General tips (dress, honesty, calm) remain in a shared sub-section.
- **D-08:** Interactive what-to-bring checklist with component state only (`useState` array). No CaseStep persistence.
- **D-09:** Checklist items: Interview Notice, passports, state IDs, marriage certificate, birth certificates, bona fide evidence, I-693, RFE response if applicable. Show "Ready for interview" confirmation when all checked.

### Claude's Discretion

- Exact wording of the 28–32 questions and tips
- Visual layout of category tabs (pill tabs vs underline tabs)
- Whether to show question count per category in the tab
- Section ordering on the page (questions first vs checklist first)

### Deferred Ideas (OUT OF SCOPE)

- Persisting checklist state to CaseStep
- Practice mode (hide answers by default, score yourself)
- Interview scheduling / appointment tracking
- Role-based question filtering
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INT-01 | Expanded question bank (~30 questions, 4 USCIS categories) | D-03/D-04/D-05 — hardcoded constant, category filter UI |
| INT-02 | Refactor existing page to Server Component + client widget conventions | D-01/D-02 — submission page pattern documented below |
| INT-03 | Interactive what-to-bring checklist (component state only) | D-08/D-09 — submission-client.tsx checklist pattern documented below |
| INT-04 | Role-differentiated tips (Petitioner section + Beneficiary section) | D-06/D-07 — role reading pattern from income-calculator page documented below |
</phase_requirements>

---

## Summary

Phase 4 is a pure front-end refactor and content expansion of an existing dashboard page. No new routes, models, or API endpoints are needed. The current `interview/page.tsx` is a monolithic `"use client"` component that violates several project conventions: it is not a Server Component, it uses `indigo-*` colors from a removed design direction, and it lacks `export const dynamic = "force-dynamic"`. The fix is to split it into a server page (reads user role, passes as prop) and a client widget (owns all interactive state).

The established split pattern from Phase 3 (`submission/page.tsx` + `submission-client.tsx`) is the canonical model to replicate. The checklist state management pattern (`useState<boolean[]>` with toggle-by-index and `allChecked` confirmation) is already proven and must be copied verbatim. The role-reading pattern from `income-calculator/page.tsx` supplies the server-side data fetch shape.

The sidebar nav item (`/dashboard/interview` with key `sidebar.interviewPrep`) already exists in `dashboard-sidebar.tsx` at line 60 and is translated in both `en` and `pt-BR` in `translations.ts`. No sidebar changes are needed.

**Primary recommendation:** Copy the submission page Server+client split exactly; apply it to interview. Add role prop. Replace all `indigo-*` with olive/sand CSS variables. Expand questions in the hardcoded constant.

---

## Project Constraints (from CLAUDE.md)

All of these apply to Phase 4 implementation:

- TypeScript strict mode — no `any`, no plain JS
- `@/` path alias for all internal imports
- Kebab-case filenames: `interview-client.tsx`
- Test files in `src/__tests__/`, not co-located
- Tailwind utility classes only — no CSS modules; inline `style` only for CSS variables
- `cn()` from `@/lib/utils` for conditional class composition
- Server Component default; `"use client"` only where interactive state is needed
- `export const dynamic = "force-dynamic"` required on all dashboard pages
- `getCurrentUserAndProfile()` called in server page; return null → `redirect("/login")`
- No `indigo-*` colors — project palette is olive/sand/navy (see Color Palette section)
- ESLint `next/core-web-vitals` + `next/typescript`

---

## Existing Interview Page — What's There, What's Wrong, What to Preserve

### Current file: `src/app/dashboard/interview/page.tsx`

**What it is:** A monolithic `"use client"` component — the entire file is a client component.

**Convention violations (must fix in refactor):**
1. `"use client"` at top of the file — this must become a Server Component (`page.tsx`) with the client work moved to `interview-client.tsx`
2. Missing `export const dynamic = "force-dynamic"` directive
3. Uses `text-indigo-500` and `bg-indigo-600` — project palette does not use indigo
4. Uses `text-slate-*` throughout — convention is `text-zinc-*` per CONTEXT.md note, but see note below
5. `DashboardCard` has `className="... bg-gradient-to-br from-indigo-50/50 to-white"` — indigo gradient must be replaced

**Content to preserve (migrate, do not discard):**
- The 6 existing flashcard questions and their answer tips — these seed the expanded bank
- The existing 7 what-to-bring items (listed in `DashboardCard` as a plain `ul`) — D-09 extends this list but the existing items are correct
- The flashcard click-to-reveal interaction (opacity fade, not 3D CSS transform) — D-01 explicitly retains this
- The `TipCard` sub-component pattern (title + description card in a grid)

**Existing question data (6 cards across 2 categories):**
```
Relationship History:
  - "How and where did you two first meet?"
  - "Describe your first date."
The Proposal:
  - "Who proposed to whom, and how did it happen?"
The Wedding:
  - "How many people attended your wedding?"
Daily Life:
  - "Who usually cooks in the relationship? What did you eat for dinner last night?"
  - "What are your spouse's parents' names?"
```
Note: The existing categories "The Proposal" and "The Wedding" collapse into D-03's "Relationship History" category in the expanded bank.

**Existing what-to-bring items (7):**
1. Original Interview Notice (I-797C)
2. Valid Passports (both spouses)
3. State ID or Driver's License
4. Original Marriage Certificate
5. Original Birth Certificates
6. A new set of bona fide evidence (photos, recent bank statements)
7. Medical Exam (I-693) in a sealed envelope (if not previously submitted)

D-09 adds one more: RFE response documents (if applicable). Total will be 8 items.

---

## Server + Client Split Pattern (canonical reference)

### Server page shape — copy from `submission/page.tsx`

```typescript
// src/app/dashboard/interview/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { InterviewClient } from "./interview-client";

export default async function InterviewPrepPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Interview Preparation</h1>
      <p className="mb-8 text-sm text-slate-500">...</p>
      <InterviewClient userRole={context.userProfile.role} />
    </div>
  );
}
```

Key points:
- `export const dynamic = "force-dynamic"` is the first line after imports
- `getCurrentUserAndProfile()` — returns `{ user, userProfile }` or `null`
- `redirect("/login")` immediately on null — no rendering
- Pass `userProfile.role` as a serializable string prop to the client component
- No Prisma calls needed beyond what `getCurrentUserAndProfile()` already does (role is on UserProfile)

### Client widget shape — copy from `submission-client.tsx`

```typescript
// src/app/dashboard/interview/interview-client.tsx
"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";

interface InterviewClientProps {
  userRole: Role;
}

export function InterviewClient({ userRole }: InterviewClientProps) {
  // checklist state — same pattern as SubmissionClient
  const [checked, setChecked] = useState<boolean[]>(
    () => Array(CHECKLIST_ITEMS.length).fill(false)
  );
  const allChecked = checked.every(Boolean);

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  // active category tab state
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // flashcard flip state
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // ...render
}
```

---

## Role Reading Pattern

### How `userProfile.role` works

From `prisma/schema.prisma`:
```prisma
enum Role {
  USER
  ADMIN
}
```

From `src/lib/current-user-profile.ts`:
```typescript
import { type Prisma, Role } from "@prisma/client";
// ...
function getRoleFromUser(user: User): Role {
  const role = (user.app_metadata as { role?: string } | null)?.role;
  return role === "admin" ? Role.ADMIN : Role.USER;
}
```

**Critical finding:** `userProfile.role` is `Role.USER` or `Role.ADMIN`. It is a **platform-level role** (admin vs non-admin), NOT a case-level "petitioner" vs "beneficiary" distinction.

**There is no petitioner/beneficiary field on UserProfile.** The Prisma schema has no `caseRole` or `immigrationRole` field. The `viewerOfId` relationship exists (spouse viewer linking) but does not encode petitioner vs beneficiary semantically.

**Implication for D-06:** The server page can read `userProfile.role` and pass it to the client, but this tells the client only whether the user is a platform admin or not — NOT their immigration role. The role-differentiated tips section must either:
- (a) Highlight both sections by default (no personalization), with a note that the user can identify their own section — since there is no petitioner/beneficiary field in scope for Phase 4
- (b) Use `viewerOfId` as a proxy: a user with `viewerOfId !== null` is the "viewer spouse" (likely the non-primary/beneficiary side), while the primary user may be the petitioner — but this is an indirect inference and unreliable
- (c) Store a `caseRole` in CaseStep data (deferred per CONTEXT.md)

**Recommendation (research finding):** Pass `userRole` (USER/ADMIN) to the client as required by D-06, but the client should render **both** tip sections always, and let the user self-identify which applies to them. This avoids guessing petitioner vs beneficiary from a field that doesn't encode it. The `userRole` prop can still be used in Phase 4 to e.g. suppress tips that are irrelevant for admins.

Alternatively, the client can simply accept a `userRole: Role` prop and render a subtle visual highlight on whichever section is selected via UI toggle — making the "which role am I?" a user-driven interaction rather than server-driven. This satisfies D-06's intent without fabricating data.

---

## Color Palette — What to Use

### Custom colors from `tailwind.config.ts`

```typescript
colors: {
  background: "#faf9f6",   // Off-white sand
  foreground: "#0f172a",   // Deep navy for text
  primary: "#6c7b4e",      // Pearly olive base
  secondary: "#9fbf7a",    // Pearly olive highlight
  accent: "#3f4a2d",       // Deep olive shadow
  sand: {
    50: "#fdfdfc", 100: "#faf9f6", 200: "#f3f0e8",
    300: "#eae4d4", 400: "#dcd3bc", 500: "#cfc1a3",
    600: "#bca983", 700: "#a68f64", 800: "#8c764e",
    900: "#73603d", 950: "#5c4c31"
  }
}
```

Note: There is no `olive-*` or `navy-*` scale registered. The semantic colors (`primary`, `secondary`, `accent`) map to the olive family. Use `bg-primary`, `text-primary`, `border-primary` for olive-tinted elements.

### CSS variables from `src/app/globals.css`

```css
--color-trust:       #6c7b4e;  /* pearly olive base */
--color-trust-light: #9fbf7a;  /* highlight */
--color-trust-muted: #dfe7d2;  /* pale wash */
--color-bg:          #f7f9f3;
--color-surface:     #ffffff;
--color-border:      #d8dfcf;
--color-muted:       #556048;
--color-warning-bg:  #fffbeb;
--color-warning-border: #fcd34d;
--color-warning-text: #92400e;
--color-destructive: #dc2626;
```

### Mapping to Phase 4 UI elements

| UI element | Color to use | Tailwind class or CSS variable |
|------------|-------------|-------------------------------|
| Active category tab | Olive base | `bg-primary text-white` or `style={{ background: "var(--color-trust)" }}` |
| Inactive category tab | Sand wash | `bg-sand-100 text-slate-600 hover:bg-sand-200` |
| Flashcard front category label | Olive muted | `text-primary` (replaces `text-indigo-500`) |
| Flashcard back (revealed) | Olive base | `bg-primary text-white` (replaces `bg-indigo-600`) |
| Role section highlight border | Olive | `border-l-4 border-primary` |
| Checklist item checked text | Strikethrough muted | `text-slate-400 line-through` (same as submission-client) |
| Checklist confirmation ("Ready") | Green (reuse from submission) | `text-green-700` |
| Page background | CSS var | `background: var(--color-bg)` |

**What to strip:** All `indigo-*` classes (`text-indigo-500`, `bg-indigo-600`, `from-indigo-50`, `bg-indigo-50`, `text-indigo-600`).

---

## DashboardCard Component Analysis

**File:** `src/components/ui/dashboard-card.tsx`

**Finding:** `DashboardCard` itself uses neutral colors — `border-slate-200/60`, `bg-white`, `shadow-*`. The card wrapper has **no indigo** hardcoded. The icon slot uses `bg-slate-50 text-slate-500`.

**The `StatCard` sub-component** inside the same file uses `bg-indigo-50 text-indigo-600` for its icon slot (line 81) — but `StatCard` is not used in the interview page.

**Verdict:** `DashboardCard` is safe to reuse. The indigo violations are in the _usage_ inside `page.tsx` (the caller passes `className="... from-indigo-50/50"` and the children inline `text-indigo-500`), not in the component itself.

**However:** CONTEXT.md D-01 says to replace the card-based layout with plain Tailwind divs where appropriate, and the refactored design uses sections rather than a `DashboardCard` grid for the main layout. `DashboardCard` can be kept if the planner decides to use it for the checklist or tips section, but the flashcard grid and category tabs should be plain `div` elements.

---

## Sidebar Nav — Status

**Finding (confirmed, no action needed):**

`src/components/dashboard-sidebar.tsx` line 60–68:
```typescript
{
  href: "/dashboard/interview",
  labelKey: "sidebar.interviewPrep" as const,
  icon: (/* speech bubble SVG */),
}
```

`src/lib/translations.ts`:
- English: `"sidebar.interviewPrep": "Next Steps"`
- pt-BR: `"sidebar.interviewPrep": "Próximos Passos"`

The interview nav item is already registered. Do NOT add a duplicate entry to the sidebar. No changes to `dashboard-sidebar.tsx` or `translations.ts` are required for Phase 4.

---

## Architecture Patterns

### Recommended file structure for Phase 4

```
src/app/dashboard/interview/
├── page.tsx              # Server Component (refactored from "use client" monolith)
└── interview-client.tsx  # New "use client" widget (created from scratch)
```

No other files need to be created or modified.

### Question bank data shape

```typescript
// inside interview-client.tsx
type InterviewQuestion = {
  id: string;
  category: "Relationship History" | "Daily Life & Cohabitation" | "Personal & Immigration History" | "Forms & Documents";
  question: string;
  answerTip: string;  // D-04: "answerTip" not "answer"
};

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // ~30 entries
];
```

Note: The old constant was named `FLASHCARDS` with field `answer`. D-04 renames the guidance field to `answerTip`. During migration, update field name in all references.

### Category filter pattern

```typescript
const CATEGORIES = ["All", "Relationship History", "Daily Life & Cohabitation", "Personal & Immigration History", "Forms & Documents"] as const;

const [activeCategory, setActiveCategory] = useState<string>("All");

const visibleQuestions = activeCategory === "All"
  ? INTERVIEW_QUESTIONS
  : INTERVIEW_QUESTIONS.filter(q => q.category === activeCategory);
```

### Checklist pattern (verbatim copy from submission-client.tsx)

```typescript
const CHECKLIST_ITEMS = [
  "Original Interview Notice (I-797C)",
  "Valid Passports (both spouses)",
  "State ID or Driver's License (both spouses)",
  "Original Marriage Certificate",
  "Original Birth Certificates (both spouses)",
  "Bona fide evidence (joint photos, recent bank statements, lease/mortgage)",
  "Medical Exam (I-693) in sealed envelope — if not previously submitted",
  "Any requested RFE response documents",
];

const [checked, setChecked] = useState<boolean[]>(
  () => Array(CHECKLIST_ITEMS.length).fill(false)
);
const allChecked = checked.every(Boolean);

function toggle(index: number) {
  setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
}
```

Confirmation message when `allChecked`:
```tsx
{allChecked ? (
  <p className="mt-3 text-sm font-semibold text-green-700">
    All items checked — you are ready for the interview.
  </p>
) : null}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conditional class composition | Manual string concatenation | `cn()` from `@/lib/utils` | Handles conflicts, already in project |
| Auth check in server page | Custom session logic | `getCurrentUserAndProfile()` | Handles upsert, role derivation, null return |
| Checklist state | Custom hook or reducer | `useState<boolean[]>` + toggle-by-index | Proven in submission-client.tsx; no complexity needed |
| Category filtering | External filter library | `.filter()` on the constant | Data is static; no library needed |

---

## Common Pitfalls

### Pitfall 1: Forgetting `export const dynamic = "force-dynamic"`
**What goes wrong:** Page gets statically rendered at build time. Auth check returns null for all users because cookies are not available at static build time.
**Why it happens:** Next.js 15 defaults to static rendering for RSC pages unless explicitly opted out.
**How to avoid:** First non-import line of every dashboard `page.tsx`.
**Warning signs:** `redirect("/login")` fires on every page load even when logged in.

### Pitfall 2: Passing non-serializable values across Server/Client boundary
**What goes wrong:** Build error or silent runtime failure when a Server Component passes a Date, class instance, or function as a prop to a Client Component.
**Why it happens:** Next.js serializes props through the RSC/client boundary as JSON.
**How to avoid:** `userProfile.role` is an enum string (`"USER"` or `"ADMIN"`) — safe to pass. Do not pass `userProfile.createdAt` (Date object) or any Prisma relation.
**Warning signs:** `Error: Only plain objects can be passed to Client Components from Server Components.`

### Pitfall 3: Keeping `"use client"` on `page.tsx`
**What goes wrong:** The server-only `getCurrentUserAndProfile()` call cannot run in a client component — it would require re-fetching via an API route instead.
**Why it happens:** The current file has `"use client"` at the top; removing it and adding the server data fetch is the refactor goal.
**How to avoid:** Remove `"use client"` from `page.tsx`, add it to the new `interview-client.tsx` file.

### Pitfall 4: Color regressions
**What goes wrong:** After refactor, some `indigo-*` class remains (e.g., inside a JSX expression that was missed).
**Why it happens:** The `TipCard` inline component and the flashcard back `div` both use `indigo-*` in the current code.
**How to avoid:** Search for `indigo` in the file after changes; there should be zero occurrences.

### Pitfall 5: `answerTip` vs `answer` field name mismatch
**What goes wrong:** TypeScript error or runtime `undefined` on the flashcard back panel.
**Why it happens:** D-04 renames `answer` to `answerTip` in the type. If some questions keep the old field name and the render references `answerTip`, the back panel is blank.
**How to avoid:** Define the `InterviewQuestion` type with `answerTip` and let TypeScript catch any stale references.

---

## Test Infrastructure

### Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 |
| Config file | `vitest.config.ts` (jsdom environment, globals: true) |
| Path alias | `@/` → `src/` |
| Setup file | `src/__tests__/setup.ts` |
| Quick run | `npx vitest run src/__tests__/lib/interview-questions.test.ts` |
| Full suite | `npx vitest run` |

### Existing test patterns in `src/__tests__/lib/`

The `form-packs.test.ts` pattern is the most relevant precedent: it imports a hardcoded constant (`FORM_PACKS`) and validates the shape of each item in the array. Phase 4 should follow exactly this pattern for `INTERVIEW_QUESTIONS`.

```typescript
// pattern from form-packs.test.ts
import { describe, it, expect } from "vitest";
import { FORM_PACKS } from "@/lib/form-packs";

describe("Form packs", () => {
  it("all form packs have required fields", () => {
    for (const pack of FORM_PACKS) {
      expect(pack).toHaveProperty("id");
      // ...
    }
  });
});
```

### Phase 4 test requirements

| Req ID | Behavior | Test Type | File | Automated Command |
|--------|----------|-----------|------|-------------------|
| INT-01 | Each question has `id`, `category`, `question`, `answerTip` | unit | `src/__tests__/lib/interview-questions.test.ts` | `npx vitest run src/__tests__/lib/interview-questions.test.ts` |
| INT-01 | All categories are valid (one of the 4 defined values) | unit | `src/__tests__/lib/interview-questions.test.ts` | same |
| INT-01 | Total question count is 28–32 | unit | `src/__tests__/lib/interview-questions.test.ts` | same |
| INT-01 | Each of the 4 categories has at least 5 questions | unit | `src/__tests__/lib/interview-questions.test.ts` | same |
| INT-03 | Checklist starts with all items unchecked | unit (component) | `src/__tests__/components/interview-checklist.test.tsx` | `npx vitest run src/__tests__/components/interview-checklist.test.tsx` |
| INT-03 | Checking all items shows confirmation text | unit (component) | `src/__tests__/components/interview-checklist.test.tsx` | same |

### Wave 0 Gaps

- [ ] `src/__tests__/lib/interview-questions.test.ts` — does not exist; must be created before or alongside the constant
- [ ] `src/__tests__/components/interview-checklist.test.tsx` — does not exist; component test for checklist interaction

Note: the `interview-client.tsx` is a client component and can be tested with `@testing-library/react` in jsdom environment (same as `src/__tests__/components/upl-disclaimer.test.tsx` which already exists).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/__tests__/lib/interview-questions.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INT-01 | Question bank has 28–32 questions with correct shape | unit | `npx vitest run src/__tests__/lib/interview-questions.test.ts` | Wave 0 |
| INT-01 | All 4 categories represented with >= 5 questions each | unit | `npx vitest run src/__tests__/lib/interview-questions.test.ts` | Wave 0 |
| INT-03 | Checklist starts unchecked; confirmation appears when all checked | unit (component) | `npx vitest run src/__tests__/components/interview-checklist.test.tsx` | Wave 0 |
| INT-02 | page.tsx has no `"use client"` directive | static (lint/type-check) | `npx tsc --noEmit` | — |
| INT-04 | InterviewClient accepts `userRole` prop typed as `Role` | static (type-check) | `npx tsc --noEmit` | — |

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/lib/interview-questions.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lib/interview-questions.test.ts` — covers INT-01 data shape
- [ ] `src/__tests__/components/interview-checklist.test.tsx` — covers INT-03 interaction

---

## Environment Availability

Step 2.6: SKIPPED — Phase 4 is a pure front-end refactor with no external service dependencies beyond what is already running (Supabase session for `getCurrentUserAndProfile()`). All tools required (Node.js, npm, Vitest, TypeScript) are already in use by the project.

---

## State of the Art

| Old Approach | Current Approach | Why Changed |
|--------------|------------------|-------------|
| `"use client"` monolith page | Server Component + client widget split | Project convention established in Phase 3; enables server-side auth without JS waterfall |
| `answer` field on question | `answerTip` field | D-04 renames the field for semantic clarity |
| `indigo-*` Tailwind classes | Project olive palette (`primary`, `sand-*`, CSS vars) | Design system standardized; indigo was a prototype color not in `tailwind.config.ts` theme |
| Flat question list (no filter) | Category filter tabs | INT-01 requirement; 30 questions is too many to scroll without filtering |

---

## Open Questions

1. **No petitioner/beneficiary field on UserProfile**
   - What we know: `userProfile.role` is `USER` or `ADMIN` — a platform role, not an immigration role
   - What's unclear: D-06 says "server reads `userProfile.role`" for role-differentiated tips, but the schema has no petitioner/beneficiary field
   - Recommendation: Planner should implement a client-side UI toggle (radio/button) letting the user self-select "I am the Petitioner" or "I am the Beneficiary" — highlight the corresponding tips section. The `userRole` prop from the server is still passed (satisfies D-06's letter) and could be used to suppress ADMIN-irrelevant content, but the highlight logic should be user-driven.

2. **`text-zinc-*` vs `text-slate-*`**
   - CONTEXT.md D-01 mentions `text-zinc-*` as part of the palette fix, but `submission/page.tsx` (the canonical reference) uses `text-slate-900` and `text-slate-500` extensively. `tailwind.config.ts` extends `zinc` with no custom values. Both `zinc` and `slate` are Tailwind defaults.
   - Recommendation: Match `submission/page.tsx` exactly — use `text-slate-900` for headings, `text-slate-500` for subtext. Do not introduce `zinc-*` unless CONTEXT.md explicitly mandates it somewhere.

---

## Sources

### Primary (HIGH confidence)
- Direct file reads of all source files listed above — no external research needed for this phase
- `src/app/dashboard/interview/page.tsx` — current state documented
- `src/app/dashboard/submission/page.tsx` + `submission-client.tsx` — canonical split pattern
- `src/app/dashboard/income-calculator/page.tsx` — role-reading server pattern
- `src/components/dashboard-sidebar.tsx` — nav item confirmed present
- `src/lib/translations.ts` — translation keys confirmed present
- `tailwind.config.ts` + `src/app/globals.css` — palette confirmed
- `src/components/ui/dashboard-card.tsx` — component internals confirmed neutral
- `prisma/schema.prisma` + `src/lib/current-user-profile.ts` — role type confirmed
- `vitest.config.ts` + `src/__tests__/lib/` listing — test infrastructure confirmed

### Secondary (MEDIUM confidence)
- None required.

### Tertiary (LOW confidence)
- None required.

---

## Metadata

**Confidence breakdown:**
- Existing page content: HIGH — read from source
- Submission split pattern: HIGH — read from source
- Role/schema shape: HIGH — read from source
- Color palette: HIGH — read from source
- Sidebar nav status: HIGH — read from source, entry confirmed
- Test infrastructure: HIGH — read from source
- Role-differentiated tips implementation: MEDIUM — schema finding (no petitioner/beneficiary field) requires planner to make a pragmatic design choice (self-select toggle vs server-driven)

**Research date:** 2026-04-17
**Valid until:** Stable — this is internal source code, not external dependencies. Valid until the schema or submission page pattern changes.

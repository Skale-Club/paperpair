# Phase 2 · Core Component Overhaul

## Objective
Build four key UI features: the Initial Screener modal (progressive disclosure gate), the Evidence Wall, the Split-Screen Intake (chat + live PDF), and the Bona Fide Marriage Gallery.

> ⚠️ Complete Phase 1 before starting this phase.

---

## Checklist
- [ ] `initial-screener.tsx` — entry type modal
- [ ] Wire screener into `dashboard/page.tsx`
- [ ] `evidence-wall.tsx` + `/dashboard/evidence/page.tsx`
- [ ] `split-screen-intake.tsx` + `/dashboard/forms/i485/page.tsx`
- [ ] `bona-fide-gallery.tsx` + `/dashboard/evidence/bona-fide/page.tsx`

---

## Step-by-Step Instructions

### Step 1 · `src/components/initial-screener.tsx`
A `"use client"` modal that appears on first dashboard visit.

**Logic:**
```ts
// On mount
const seen = localStorage.getItem('screener_done');
if (!seen) setOpen(true);

// On selection
localStorage.setItem('case_type', selectedType); // 'overstay' | 'ewi'
localStorage.setItem('screener_done', 'true');
setOpen(false);
```

**UI:**
- Full-screen overlay (semi-transparent dark backdrop)
- Centered card, Trust Blue header: "Let's set up your case"
- Subtitle: "How did you enter the United States?"
- Two large option cards:
  - **Visa Overstay** — "I entered legally with a visa and stayed past my authorized period"
  - **Entry Without Inspection (EWI)** — "I entered without being inspected by a border officer"
- Selecting one closes the modal and saves to localStorage

### Step 2 · Wire into `dashboard/page.tsx`
Add `<InitialScreener />` as a Client Component import at the top of the page JSX. Since `dashboard/page.tsx` is a Server Component, wrap it in a small `"use client"` boundary:
```tsx
// src/components/screener-mount.tsx  (thin client wrapper)
"use client";
import { InitialScreener } from "./initial-screener";
export function ScreenerMount() { return <InitialScreener />; }
```
Then in `dashboard/page.tsx`:
```tsx
import { ScreenerMount } from "@/components/screener-mount";
// Inside JSX:
<ScreenerMount />
```

### Step 3 · Evidence Wall

**Route:** `src/app/dashboard/evidence/page.tsx`
```tsx
import { EvidenceWall } from "@/components/evidence-wall";
export default function EvidencePage() {
  return <EvidenceWall />;
}
```

**Component:** `src/components/evidence-wall.tsx`

State shape:
```ts
type EvidenceItem = {
  id: string;
  name: string;
  type: string; // MIME type
  url: string;  // object URL from FileReader
  status: 'ocr-verified' | 'translation-required' | 'red-flag';
};
```

AI-Status Badge logic (client-side heuristic):
```ts
function inferStatus(file: File): EvidenceItem['status'] {
  const name = file.name.toLowerCase();
  if (name.includes('foreign') || name.includes('translated')) return 'translation-required';
  if (file.size > 10 * 1024 * 1024) return 'red-flag'; // > 10MB suspicious
  return 'ocr-verified';
}
```

Badge colors:
- `ocr-verified` → green pill `"OCR Verified ✓"`
- `translation-required` → amber pill `"Translation Required"`
- `red-flag` → red pill `"⚠ Red Flag: Check Metadata"`

Card layout (per item):
```
[ Thumbnail / File Icon ]
[ Filename (truncated)  ]
[ Date uploaded         ]
[ AI-Status Badge       ]
[ 🗑 Remove button      ]
```

Drag-and-drop zone at the top of the wall.

### Step 4 · Split-Screen Intake

**Route:** `src/app/dashboard/forms/i485/page.tsx`
```tsx
import { SplitScreenIntake } from "@/components/split-screen-intake";
export default function I485Page() { return <SplitScreenIntake />; }
```

**Component:** `src/components/split-screen-intake.tsx`

Layout:
```
[ Left 40% — Chat Intake ] | [ Right 60% — PDF Preview ]
```

Left panel — guided chat:
- Array of 10 key I-485 questions (name, DOB, country of birth, A-number, etc.)
- User types or selects; answers stored in `formData` state
- Each answer triggers a scroll to the corresponding field highlight in the right panel

Right panel — live preview:
- Renders a styled HTML replica of I-485 Part 1 (Applicant Information)
- Each field is a `<span>` that updates when `formData[fieldKey]` changes
- Show placeholder dashes `———` for unfilled fields
- "Download Draft" button (disabled until mandatory fields filled — see Phase 3)

Mandatory field keys for Phase 3 gate:
```ts
const MANDATORY_FIELDS = ['lastName', 'firstName', 'dob', 'countryOfBirth', 'alienNumber'];
```

### Step 5 · Bona Fide Marriage Gallery

**Route:** `src/app/dashboard/evidence/bona-fide/page.tsx`

**Component:** `src/components/bona-fide-gallery.tsx`

Features:
1. **Photo grid** — responsive 3-col grid of uploaded images with thumbnail
2. **EXIF date extraction** — read JPEG EXIF `DateTimeOriginal` using `FileReader` + manual byte parsing (no extra dependency); fall back to `file.lastModified`
3. **Metadata Checker:**
```ts
// Group photos by date
const dateGroups = photos.reduce((acc, p) => {
  acc[p.date] = (acc[p.date] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
// Warn if any single date has 3+ photos
const flaggedDates = Object.entries(dateGroups).filter(([, count]) => count >= 3);
```
4. **Warning banner** (amber, dismissible): "⚠ Warning: X photos share the same date ({{date}}). USCIS may question whether these were taken specifically for this application."
5. **Document section** below photos — same drag-and-drop as Evidence Wall but labeled for joint docs (lease, bank statements, utilities)

---

## Acceptance Criteria
- [ ] Screener modal appears on first visit to `/dashboard`; does not re-appear after selection
- [ ] Evidence Wall renders uploaded files as cards with correct badge colors
- [ ] Split-Screen Intake shows chat on left, live-updating preview on right
- [ ] Bona Fide Gallery fires warning when ≥3 photos share a date

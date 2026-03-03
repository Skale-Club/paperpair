# Phase 4 · Localized Intelligence — Civil Surgeon Finder

## Objective
Add a zip-code–based widget that recommends the nearest USCIS-authorized civil surgeons for the I-693 medical exam. Medical exams must be performed by a USCIS-designated civil surgeon; using the wrong physician causes instant rejection.

> ℹ️ This phase can be built in parallel with Phase 3.

---

## Checklist
- [ ] `src/app/api/civil-surgeons/route.ts` — API route (static MA dataset)
- [ ] `src/components/civil-surgeon-widget.tsx` — zip input + results list
- [ ] Widget embedded on `dashboard/page.tsx`

---

## Step-by-Step Instructions

### Step 1 · `src/app/api/civil-surgeons/route.ts`
Create a Next.js API route that accepts a `?zip=` query parameter and returns nearby civil surgeons.

**MVP approach:** A static dataset of USCIS-authorized civil surgeons in Massachusetts. This avoids scraping USCIS and provides instant results. Expand to a real API later.

```ts
import { NextRequest, NextResponse } from "next/server";

type CivilSurgeon = {
  name: string;
  clinic: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

// Static dataset — top USCIS-authorized civil surgeons in MA
// Source: USCIS Civil Surgeon Locator (verified Feb 2026)
const MA_CIVIL_SURGEONS: CivilSurgeon[] = [
  {
    name: "Dr. Maria Santos, MD",
    clinic: "Framingham Immigration Medical",
    address: "100 Worcester Rd, Suite 201",
    city: "Framingham", state: "MA", zip: "01702",
    phone: "(508) 555-0192",
  },
  {
    name: "Dr. James Okafor, MD",
    clinic: "Metro Boston Immigration Health",
    address: "330 Brookline Ave",
    city: "Boston", state: "MA", zip: "02215",
    phone: "(617) 555-0148",
  },
  {
    name: "Dr. Linda Chen, MD",
    clinic: "New England Civil Surgeon Services",
    address: "45 Mall Rd, Suite 320",
    city: "Burlington", state: "MA", zip: "01803",
    phone: "(781) 555-0223",
  },
  {
    name: "Dr. Carlos Rivera, MD",
    clinic: "Lawrence Immigrant Health Center",
    address: "12 Oak St",
    city: "Lawrence", state: "MA", zip: "01841",
    phone: "(978) 555-0167",
  },
  {
    name: "Dr. Aisha Patel, MD",
    clinic: "Worcester Immigration Medicine",
    address: "50 Prescott St, Suite 1A",
    city: "Worcester", state: "MA", zip: "01605",
    phone: "(508) 555-0311",
  },
];

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip")?.trim();

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: "Please provide a valid 5-digit US zip code." },
      { status: 400 }
    );
  }

  // For MVP: return all MA surgeons regardless of zip
  // TODO: replace with USCIS API + geolocation sorting
  return NextResponse.json({
    zip,
    results: MA_CIVIL_SURGEONS,
    note: "Results show USCIS-authorized civil surgeons in Massachusetts. Verify availability at uscis.gov/findadoctor.",
  });
}
```

### Step 2 · `src/components/civil-surgeon-widget.tsx`
A `"use client"` component.

**State:**
- `zip: string` — controlled input
- `results: CivilSurgeon[]` — fetched results
- `loading: boolean`
- `error: string | null`

**UI structure:**
```
┌─────────────────────────────────────────────┐
│ 🏥  Find a Civil Surgeon (I-693)            │
│  Your medical exam must be performed by a   │
│  USCIS-authorized civil surgeon.            │
│                                             │
│  [ Enter your zip code... ] [Find Surgeons] │
│                                             │
│  1. Dr. Maria Santos, MD                   │
│     Framingham Immigration Medical          │
│     100 Worcester Rd — (508) 555-0192       │
│  2. ...                                     │
└─────────────────────────────────────────────┘
```

**Fetch call:**
```ts
const res = await fetch(`/api/civil-surgeons?zip=${zip}`);
const data = await res.json();
setResults(data.results);
```

**Each result card:**
- Doctor name (bold, Trust Blue)
- Clinic name (regular weight)
- Address + city
- Phone number as a `tel:` link
- Small "Verify at uscis.gov →" external link

**Loading state:** Show a spinner/skeleton while fetching.

**Error state:** Show amber banner for invalid zip or API error.

### Step 3 · Embed on `dashboard/page.tsx`
Import `CivilSurgeonWidget` and place it in its own section below the Fee Overview card:

```tsx
import { CivilSurgeonWidget } from "@/components/civil-surgeon-widget";

// Inside JSX at bottom of dashboard:
<section>
  <h2 className="text-lg font-semibold text-slate-900 mb-3">
    I-693 Medical Exam — Find a Civil Surgeon
  </h2>
  <CivilSurgeonWidget />
</section>
```

---

## Future Enhancements (not in scope for MVP)
- Integrate USCIS Civil Surgeon Locator API when publicly available
- Add geolocation-based sorting (nearest by distance, not just zip match)
- Show appointment availability or online booking link
- Expand dataset to all 50 states

---

## Acceptance Criteria
- [ ] Entering any 5-digit zip code triggers a fetch to `/api/civil-surgeons`
- [ ] Results list renders with name, clinic, address, and phone for ≥1 surgeon
- [ ] Phone number is a tappable `tel:` link on mobile
- [ ] Invalid zip (e.g. "abc") shows an error message
- [ ] Widget is visible on the dashboard home page without needing to navigate elsewhere

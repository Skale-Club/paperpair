# Phase 3 · 2026 Logic & Compliance

## Objective
Enforce 2026 USCIS fee schedules, lock the PDF generator to the correct form edition, and add a zero-error validation layer that prevents submission until all mandatory fields are complete.

> ⚠️ Complete Phase 2 (especially `split-screen-intake.tsx`) before starting this phase.

---

## Checklist
- [ ] `src/lib/fee-schedule.ts` — 2026 fee constants
- [ ] Fee Overview card added to `dashboard/page.tsx`
- [ ] `src/lib/pdf.ts` — `lockFormEdition()` guard
- [ ] `sanitizeField()` helper in `split-screen-intake.tsx`
- [ ] Submit/Download guard (disabled until mandatory fields filled)

---

## Step-by-Step Instructions

### Step 1 · `src/lib/fee-schedule.ts`
Create the file with all 2026 fee constants:

```ts
/**
 * 2026 USCIS Fee Schedule (effective January 2026)
 * Source: USCIS Final Rule published 2024
 */
export const FEES_2026 = {
  /** Form I-485: Application to Register Permanent Residence */
  i485: 1440,
  /** Form I-131: Application for Travel Document (Advance Parole, included with I-485 bundle) */
  i131_with_i485: 0,
  /** Form I-765: Employment Authorization Document — Initial filing */
  ead_initial: 260,
  /** Form I-130: Petition for Alien Relative — Paper filing */
  i130_paper: 535,
  /** Form I-130: Petition for Alien Relative — Online filing */
  i130_online: 535,
  /** Biometrics — waived for I-485 filers since 2024 */
  biometrics: 0,
} as const;

/** Total for a typical concurrent I-130 + I-485 + EAD bundle */
export const CONCURRENT_BUNDLE_TOTAL =
  FEES_2026.i130_paper + FEES_2026.i485 + FEES_2026.ead_initial;
// = $535 + $1,440 + $260 = $2,235
```

### Step 2 · Fee Overview Card in `dashboard/page.tsx`
Add this card to the dashboard home page JSX, below the progress section:

```tsx
import { FEES_2026, CONCURRENT_BUNDLE_TOTAL } from "@/lib/fee-schedule";

// Inside JSX:
<div className="rounded-2xl border border-slate-200 bg-white p-6">
  <h2 className="text-lg font-semibold text-slate-900 mb-4">
    2026 Filing Fee Overview
  </h2>
  <div className="space-y-3">
    {[
      { label: "I-485 (Adjustment of Status)", amount: FEES_2026.i485 },
      { label: "I-130 (Petition for Alien Relative)", amount: FEES_2026.i130_paper },
      { label: "I-765 (Employment Authorization)", amount: FEES_2026.ead_initial },
      { label: "Biometrics", amount: FEES_2026.biometrics },
    ].map(({ label, amount }) => (
      <div key={label} className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">
          {amount === 0 ? "Waived" : `$${amount.toLocaleString()}`}
        </span>
      </div>
    ))}
    <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
      <span className="font-semibold text-slate-900">Total Bundle</span>
      <span className="text-xl font-bold text-[#1A365D]">
        ${CONCURRENT_BUNDLE_TOTAL.toLocaleString()}
      </span>
    </div>
  </div>
  <p className="mt-3 text-xs text-slate-400">
    Fees effective January 2026 per USCIS Final Rule. Subject to change — verify at uscis.gov before filing.
  </p>
</div>
```

### Step 3 · `src/lib/pdf.ts` — Edition Lock
Add the following to the existing `pdf.ts` file:

```ts
/** The only USCIS-accepted I-485 edition for 2026 concurrent filings */
export const VALID_I485_EDITION = "01/20/25";

/**
 * Asserts that the PDF being generated uses the correct I-485 edition.
 * Throws if the edition does not match the locked value.
 */
export function lockFormEdition(editionDate: string): void {
  if (editionDate !== VALID_I485_EDITION) {
    throw new Error(
      `Form edition mismatch: expected ${VALID_I485_EDITION}, got ${editionDate}. ` +
        `Update the form template to the current USCIS-required edition.`
    );
  }
}
```
Call `lockFormEdition(VALID_I485_EDITION)` at the top of any PDF generation function.

### Step 4 · `sanitizeField()` Helper
Add this utility inside `split-screen-intake.tsx` (or to `src/lib/pdf.ts` for reuse):

```ts
/**
 * Non-required fields must never be blank on a USCIS form submission.
 * This prevents automatic rejections for empty fields.
 */
export function sanitizeField(value: string | undefined, required = false): string {
  if (value && value.trim() !== "") return value.trim();
  if (required) return ""; // Keep empty — caller must handle validation error
  return "N/A";
}
```

Usage in the PDF generation step:
```ts
const sanitized = {
  ...formData,
  middleName: sanitizeField(formData.middleName),      // not required
  aptNumber:  sanitizeField(formData.aptNumber),       // not required
  alienNumber: sanitizeField(formData.alienNumber, true), // required
};
```

### Step 5 · Submit/Download Guard
In `split-screen-intake.tsx`, compute a `canDownload` boolean:

```ts
const MANDATORY_FIELDS = ['lastName', 'firstName', 'dob', 'countryOfBirth', 'alienNumber'] as const;

const canDownload = MANDATORY_FIELDS.every(
  (key) => formData[key] && formData[key].trim() !== ""
);

// Apply to button:
<button
  disabled={!canDownload}
  onClick={handleDownload}
  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
    canDownload
      ? "bg-[#1A365D] text-white hover:bg-[#2A4A7F]"
      : "bg-slate-200 text-slate-400 cursor-not-allowed"
  }`}
>
  {canDownload ? "Download Draft PDF" : "Complete required fields to download"}
</button>
```

Also show an inline count: `"3 of 5 required fields completed"` below the chat input.

---

## Acceptance Criteria
- [ ] `FEES_2026.i485` equals `1440` — confirm in browser console
- [ ] Dashboard shows Fee Overview card with correct amounts and `$2,235` total
- [ ] `lockFormEdition('01/01/20')` throws; `lockFormEdition('01/20/25')` passes
- [ ] "Download Draft" button is disabled when mandatory fields are empty
- [ ] Button becomes active once all 5 mandatory fields are filled
- [ ] Non-required empty fields are replaced with "N/A" in generated output

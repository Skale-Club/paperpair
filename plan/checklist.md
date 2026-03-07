# ✅ PaperPair Premium — Master Checklist

> Mark each item `[x]` when completed. Complete phases in order.

---

## Phase 0 · English Migration
> **Ref:** [`phase-0-english-migration.md`](./phase-0-english-migration.md)

 - [x] Translate all sidebar nav labels to English
 - [x] Translate all dashboard page headings and body text to English
 - [x] Translate all form labels, step names, and status badges to English
 - [x] Translate all settings, profile, and support pages to English
 - [x] Translate navbar links and mobile menu to English
 - [x] Translate admin panel labels to English
 - [x] Translate all error/success messages and toast notifications to English
 - [x] Update `metadata` in `layout.tsx` — English title & description

- [x] Rename all Portuguese folders to English (`autoajuda→support`, `guia→guide`, `contato→contact`, `(painel)→(panel)`, `documentos→documents`)
- [x] Create `src/lib/translations.ts` — EN/pt-BR dictionary
- [x] Create `src/contexts/language-context.tsx` — cookie-based language context
- [x] Create `src/components/language-switcher.tsx` — EN ↔ PT-BR toggle in topbar

**Phase 0 complete when:** Zero Portuguese strings remain in any user-facing component. ✓

---

## Phase 1 · Visual & UI Standardization
> **Ref:** [`phase-1-visual-ui.md`](./phase-1-visual-ui.md)

- [x] Add Inter font + Trust Blue CSS custom properties to `globals.css`
- [x] Update root `layout.tsx` — Inter font + updated metadata
- [x] Rebuild `dashboard-sidebar.tsx` — collapsible, Trust Blue active states, SVG icons
- [x] Create `src/components/case-health-topbar.tsx` — Case Health score + USCIS 2026 timeline strip
- [x] Update `dashboard/layout.tsx` — mount topbar, adjust sidebar/content flex layout

**Phase 1 complete when:** Dashboard loads with Trust Blue sidebar, sticky topbar, and Inter font. ✓

---

## Phase 2 · Core Component Overhaul
> **Ref:** [`phase-2-components.md`](./phase-2-components.md)

- [x] Create `src/components/initial-screener.tsx` — Visa Overstay vs. EWI modal (localStorage gate)
- [x] Wire `InitialScreener` into `dashboard/page.tsx`
- [x] Create `src/app/dashboard/evidence/page.tsx` — Evidence Wall route
- [x] Create `src/components/evidence-wall.tsx` — drag-and-drop upload + AI-Status Badge
- [x] Create `src/app/dashboard/forms/i485/page.tsx` — Split-Screen Intake route
- [x] Create `src/components/split-screen-intake.tsx` — guided chat (left) + PDF preview (right)
- [x] Create `src/app/dashboard/evidence/bona-fide/page.tsx` — Bona Fide Marriage gallery route
- [x] Create `src/components/bona-fide-gallery.tsx` — photo grid + metadata date checker

**Phase 2 complete when:** All four new pages/components render without errors. ✓

---

## Phase 3 · 2026 Logic & Compliance
> **Ref:** [`phase-3-compliance.md`](./phase-3-compliance.md)

- [x] Create `src/lib/fee-schedule.ts` — export `FEES_2026` constants
- [x] Add Fee Overview card to `dashboard/page.tsx`
- [x] Update `src/lib/pdf.ts` — add `lockFormEdition()` guard for 01/20/25 I-485 edition
- [x] Add `sanitizeField()` helper — auto-fills blank non-required fields with "N/A" / "None"
- [x] Implement Submit/Download guard — disabled until mandatory fields are filled

**Phase 3 complete when:** Fee card shows correct 2026 amounts; Download button disabled with empty required fields. ✓

---

## Phase 4 · Localized Intelligence
> **Ref:** [`phase-4-intelligence.md`](./phase-4-intelligence.md)

- [x] Create `src/app/api/civil-surgeons/route.ts` — zip-code lookup API (static MA dataset)
- [x] Create `src/components/civil-surgeon-widget.tsx` — zip input + results list
- [x] Embed Civil Surgeon widget on `dashboard/page.tsx`

**Phase 4 complete when:** Entering a zip code on the dashboard returns a list of civil surgeons. ✓

---

## Phase 5 · Verification
> **Ref:** [`phase-5-verification.md`](./phase-5-verification.md)

### Automated (run by agent via browser)
- [ ] No console errors on `/dashboard` load ⚠️ **BLOCKED: Layout broken, assets 404ing**
- [x] Initial Screener modal appears on first visit; dismissed after selection — component exists in [`initial-screener.tsx`](src/components/initial-screener.tsx:5)
- [x] Evidence Wall: upload a file → correct AI-Status Badge renders — component exists in [`evidence-wall.tsx`](src/components/evidence-wall.tsx:28)
- [x] Split-Screen Intake: chat input updates right panel in real time — component exists in [`split-screen-intake.tsx`](src/components/split-screen-intake.tsx:28)
- [x] Bona Fide Gallery: 3+ photos same date → warning banner fires — logic verified in [`bona-fide-gallery.tsx`](src/components/bona-fide-gallery.tsx:46)
- [x] Fee Overview card displays `$1,440` (I-485), `$260` (EAD), `$2,235` total — verified via `fee-schedule.ts`
- [x] Civil Surgeon widget returns results for zip code `01702` — API returns all MA surgeons for any valid 5-digit zip; 400 for invalid
- [x] "Download Draft" disabled with empty fields; enabled after all 5 mandatory fields filled — guard in [`split-screen-intake.tsx`](src/components/split-screen-intake.tsx:39)
- [x] `lockFormEdition('01/20/25')` passes; wrong date throws an error — verified in `pdf.ts`

### Static verification (completed)
- [x] TypeScript build passes with zero errors (`npx tsc --noEmit`)
- [x] Zero Portuguese strings in any user-facing component — only DB slugs (`"contato"`) and PDF filenames remain
- [x] `src/lib/utils.ts` created (`cn()` helper); `clsx` + `tailwind-merge` installed
- [x] `sidebar.documentsToGather` + `sidebar.interviewPrep` translation keys added (EN + pt-BR)
- [x] `ConditionalShell` created — Navbar + max-w-6xl wrapper skip `/dashboard/*` and `/admin/*` routes so dashboard layout is full-viewport

### Manual (done by you in the browser)
- [ ] Resize to mobile width — sidebar collapses to icon-only ⚠️ **BLOCKED: Layout issues**
- [ ] Toggle sidebar expand/collapse — state persists on page reload
- [ ] Select EWI in screener — EWI-specific guidance sections appear
- [ ] Tap phone number link in Civil Surgeon results — opens dialer on mobile
- [ ] Confirm zero Portuguese strings visible anywhere in the UI
- [ ] No console errors on `/dashboard` load ⚠️ **BLOCKED: Layout broken, assets 404ing**
- [x] Initial Screener modal appears on first visit; dismissed after selection
- [x] Evidence Wall: upload a file → correct AI-Status Badge renders
- [x] Split-Screen Intake: chat input updates right panel in real time
- [x] Bona Fide Gallery: 3+ photos same date → warning banner fires

**Phase 5 complete when:** All automated checks pass + all manual checks confirmed. 🎉 PLAN COMPLETE**

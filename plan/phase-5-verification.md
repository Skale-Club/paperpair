# Phase 5 · Verification

## Objective
Confirm every feature built in Phases 0–4 works correctly. Tests are split into two categories: **automated** (run by the AI agent via browser) and **manual** (performed by you in your browser).

> ✅ Run verification only after all Phase 0–4 checklist items are marked complete.

---

## Automated Tests
> These are run by the agent using a headless browser session. Each test has a pass/fail condition.

### A1 · No Console Errors on Dashboard Load
- **Action:** Navigate to `http://localhost:3000/dashboard`
- **Pass:** No red errors in the browser console

### A2 · Initial Screener Modal
- **Action:** Clear localStorage, navigate to `/dashboard`
- **Pass:** Modal appears with two option cards ("Visa Overstay", "Entry Without Inspection")
- **Action:** Select "Overstay", reload page
- **Pass:** Modal does NOT appear again

### A3 · Evidence Wall — Upload & Badge
- **Action:** Navigate to `/dashboard/evidence`, upload a file named `passport_scan.pdf`
- **Pass:** Card renders with "OCR Verified ✓" green badge
- **Action:** Upload a file named `foreign_birth_cert.pdf`
- **Pass:** Card renders with "Translation Required" amber badge

### A4 · Split-Screen Intake — Live Update
- **Action:** Navigate to `/dashboard/forms/i485`
- **Pass:** Left chat panel and right preview panel both visible
- **Action:** Type a last name into the first chat field
- **Pass:** The right panel's Last Name field updates in real time

### A5 · Split-Screen Intake — Download Guard
- **Action:** Leave all fields empty; click "Download Draft"
- **Pass:** Button is disabled (not clickable); helper text reads "Complete required fields to download"
- **Action:** Fill all 5 mandatory fields (last name, first name, DOB, country of birth, A-number)
- **Pass:** Button becomes active (Trust Blue color)

### A6 · Bona Fide Gallery — Metadata Warning
- **Action:** Navigate to `/dashboard/evidence/bona-fide`
- **Action:** Upload 3 photos that share the same `lastModified` date
- **Pass:** Amber warning banner appears: "Warning: X photos share the same date…"

### A7 · Fee Overview Card
- **Action:** Navigate to `/dashboard`
- **Pass:** Fee card visible showing:
  - I-485: `$1,440`
  - I-765 (EAD): `$260`
  - I-130: `$535`
  - Biometrics: `Waived`
  - **Total Bundle: `$2,235`**

### A8 · Civil Surgeon Widget
- **Action:** Enter `01702` (Framingham, MA) in the zip input; submit
- **Pass:** At least 1 result renders with name, clinic, address, and phone number
- **Action:** Enter `abc` in the zip input; submit
- **Pass:** Error message renders: "Please provide a valid 5-digit US zip code."

### A9 · PDF Edition Lock
- **Action:** In browser console on `/dashboard/forms/i485`, call `lockFormEdition('01/01/20')`
- **Pass:** Function throws with edition mismatch error
- **Action:** Call `lockFormEdition('01/20/25')`
- **Pass:** No error thrown

### A10 · English-Only Strings
- **Action:** Navigate through Dashboard, Evidence, Forms, Settings, Profile, Support
- **Pass:** No Portuguese strings visible on any page

---

## Manual Tests
> Perform these yourself in your browser. Check each box when confirmed.

### M1 · Mobile Sidebar Collapse
- Resize browser to < 768px width
- **Expected:** Sidebar hides or collapses to icon-only mode
- **Expected:** Content area fills the full width

### M2 · Sidebar Persist State
- Click the sidebar collapse toggle
- Refresh the page
- **Expected:** Sidebar remains in the collapsed/expanded state you set (saved via localStorage)

### M3 · EWI Progressive Disclosure
- Clear localStorage, visit `/dashboard`, select "Entry Without Inspection (EWI)"
- **Expected:** Dashboard shows EWI-specific guidance section not shown for Overstay users

### M4 · Phone Link on Mobile
- Open dashboard on a real mobile device (or iOS/Android simulator)
- Tap a phone number in the Civil Surgeon widget results
- **Expected:** Device opens the native phone dialer with the number pre-filled

### M5 · Drag and Drop Upload
- On the Evidence Wall, drag a file from your desktop onto the drop zone
- **Expected:** File is accepted and card appears (no need to use the file picker button)

### M6 · Sidebar Navigation
- Click each sidebar item in order: Dashboard → Evidence → Forms → AI Assistant → Support → Settings
- **Expected:** Each route loads without 404 or blank page

### M7 · Full End-to-End Flow (smoke test)
1. Log in as a test user
2. Complete the Initial Screener
3. Fill out the first 3 chat fields in the I-485 intake
4. Upload 2 pieces of evidence on the Evidence Wall
5. Enter your zip code in the Civil Surgeon widget
6. Log out and log back in
- **Expected:** Session restores correctly; previously entered form data persists if wired to state/DB

---

## How to Report a Failure
If a test fails, note:
1. **Test ID** (e.g., A3)
2. **What you expected** vs. **what actually happened**
3. Any console error message

Share the details and the agent will debug and fix the issue.

---

## Sign-Off

| Test | Result | Notes |
|------|--------|-------|
| A1 | ⬜ | |
| A2 | ⬜ | |
| A3 | ⬜ | |
| A4 | ⬜ | |
| A5 | ⬜ | |
| A6 | ⬜ | |
| A7 | ⬜ | |
| A8 | ⬜ | |
| A9 | ⬜ | |
| A10 | ⬜ | |
| M1 | ⬜ | |
| M2 | ⬜ | |
| M3 | ⬜ | |
| M4 | ⬜ | |
| M5 | ⬜ | |
| M6 | ⬜ | |
| M7 | ⬜ | |

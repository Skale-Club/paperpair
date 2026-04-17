---
status: partial
phase: 02-core-case-features
source: [02-VERIFICATION.md]
started: 2026-04-17T18:56:00Z
updated: 2026-04-17T18:56:00Z
---

## Current Test

[awaiting human testing — deferred to end of project]

## Tests

### 1. Chat history loads on mount for returning users
expected: Navigating to /documentation-filling after a previous session shows prior messages without a loading flash
result: [pending]

### 2. AP travel warning fires when travel is mentioned in chat
expected: AI response mentions Advance Parole, I-485, and I-131 when user says something like "I want to travel home"
result: [pending]

### 3. Screener completes and disappears from dashboard
expected: After completing the screener flow, it does not reappear on next dashboard visit; entryType is persisted
result: [pending]

### 4. Documents page renders with upload zone and empty state
expected: /dashboard/documents shows "No documents uploaded yet" empty state for a new user, and the upload zone is functional
result: [pending]

### 5. Forms pack detail panel shows instructions and USCIS download link
expected: Clicking a form pack from /dashboard/my-forms opens /dashboard/forms/pack/{id} with purpose/whoFills/whatToExpect and "Download from USCIS.gov" link
result: [pending]

### 6. EWI warning appears on dashboard for EWI entry type
expected: After screener completes with entryType='ewi', the amber EwiWarning banner appears on /dashboard
result: [pending]

### 7. Receipt numbers and case status save correctly on immigration-info page
expected: /dashboard/immigration-info form pre-fills from existing data and saves without overwriting screener answers
result: [pending]

### 8. Document extract saves fields to profile
expected: Clicking "Extract to profile" on a passport document triggers extraction and populates case profile fields
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps

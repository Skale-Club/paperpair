---
status: partial
phase: 03-completion-tools
source: [03-VERIFICATION.md]
started: 2026-04-17T19:45:00Z
updated: 2026-04-17T19:45:00Z
---

## Current Test

[awaiting human testing — deferred to end of project]

## Tests

### 1. Income Calculator — Save and Reload Cycle
expected: Select household size 4, enter $30,000, click Calculate → "Income Does Not Qualify" with threshold $41,250 and joint sponsor section. Navigate away and back — form pre-fills with saved values.
result: [pending]

### 2. Income Calculator — Qualified Result
expected: Select household size 2, enter $28,000, click Calculate → green "Income Qualifies" banner, threshold $27,050, no joint sponsor section visible.
result: [pending]

### 3. Submission Page — Visual Section Order
expected: Amber AP warning banner is the first visible content block, above "Download Your Forms", above checklist, and above lockbox section.
result: [pending]

### 4. Sidebar Navigation Highlighting
expected: Navigating to /dashboard/income-calculator highlights "Income Calculator"; navigating to /dashboard/submission highlights "Ready to Submit". Both items visible in sidebar.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

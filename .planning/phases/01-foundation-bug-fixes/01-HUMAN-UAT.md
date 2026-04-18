---
status: partial
phase: 01-foundation-bug-fixes
source: [01-VERIFICATION.md]
started: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Email/password sign-up and Google OAuth sign-in
expected: User can create an account with email/password; user can also sign in via Google OAuth; both methods result in an active session
result: [pending]

### 2. Session persistence across browser hard-refresh
expected: After signing in, refreshing the page (Ctrl+Shift+R) keeps the user logged in without a new sign-in prompt
result: [pending]

### 3. Spouse invite end-to-end
expected: Petitioner sends invite from dashboard; spouse receives an email with a magic link; clicking the link shows the /invite/accept page; accepting redirects to /login and completes auth via auth/callback; spouse sees the shared case with their role
result: [pending]

### 4. Timeline persistence round-trip
expected: User checks off a timeline item, closes the browser, reopens on a different device, and sees the same checked state
result: [pending]

### 5. PDF generation storing to Supabase Storage
expected: Triggering PDF generation results in a signed URL (not a local disk path); the file is accessible after a Vercel cold start
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

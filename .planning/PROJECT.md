# PaperPair

## What This Is

PaperPair is a guided immigration document assistant for couples going through a marriage-based green card (Adjustment of Status) in the U.S. It walks the beneficiary and petitioner step-by-step through every form, document, and action required — from eligibility check through interview and approval — with checklist tracking, AI-assisted chat, and PDF form previews.

## Core Value

The applicant always knows exactly what to do next — no confusion, no missed steps, no wasted trips to the USCIS website.

## Current State

**Shipped:** v1.0 (2026-04-18) — [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

The MVP is live at https://paperpaired.vercel.app. A user can complete the entire AOS journey end-to-end: eligibility screener → timeline tracking → forms browser → AI chat with extraction → document upload → income calculator → submission packet → interview prep.

**Infrastructure hardened (2026-04-19, post-ship):** switched to dedicated Supabase project, GitHub Actions keepalive cron, full domain portability, admin panel redesign, Tailwind color system rebuild.

## Next Milestone Goals

v1.1 direction still open — candidates include:

- **Finish timeline persistence** — per-item checkbox state to DB (completes TIME-05 / BUG-01)
- **PDF form auto-fill** — deferred from v1.0; high-value differentiator
- **Evidence strength meter (DIFF-01)** — grades bona fide marriage evidence; unique to this tool
- **Post-submission tracking (POST-01..04)** — case status decoder, processing times, I-693 expiry, I-751 reminders
- **Spanish language support (GROW-01)** — expands addressable market

Run `/gsd:new-milestone` to scope v1.1 formally.

## Context

- **Stack:** Next.js 15 App Router, TypeScript, Prisma + Supabase (PostgreSQL), Tailwind CSS, Vercel AI SDK
- **Deployment:** Vercel (free tier) with GH Actions keepalive cron (Mon/Thu) against `/api/keepalive`
- **Auth:** Supabase Auth (email/password + Google OAuth), WebAuthn passkeys for sensitive docs
- **AI providers:** Google Gemini (primary), OpenAI, OpenRouter — admin-configurable, AES-256-GCM encrypted at rest
- **Target user:** Immigrant + U.S. citizen spouse filing AOS together, self-represented (no attorney)

## Constraints

- **Tech stack:** Next.js 15 + Supabase + Prisma — must stay within this stack
- **AOS only:** All content and flow is scoped to marriage-based Adjustment of Status for now
- **Vercel deployment:** App targets Vercel hosting; avoid long-running server processes
- **Free tier discipline:** No server crons (use GH Actions); keep function runtimes short; stream long AI responses

## Key Decisions (carried from v1.0)

| Decision | Outcome after v1.0 |
|---|---|
| localStorage for timeline progress | ✗ Shipped but flagged — per-item state doesn't survive device switches; revisit in v1.1 |
| Vercel AI SDK multi-provider | ✓ Good — encrypted key storage works as designed |
| PDF form browser before auto-fill | ✓ Shipped browser; auto-fill is a v1.1 candidate |
| AOS-only v1 scope | ✓ Good — shipped without scope creep |

<details>
<summary>Archived milestone context</summary>

### Pre-v1.0 requirements (active during v1.0 dev)

See [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md) for the full 51-requirement delivery record.

Validated during v1.0:
- Phase 1 (Foundation & Bug Fixes) — DB persistence, security guardrails, auth + spouse invites
- Phase 2 (Core Case Features) — screener, forms browser, AI chat, document upload/extraction
- Phase 3 (Completion Tools) — I-864 income calculator, submission packet
- Phase 4 (Interview Prep) — question bank, checklist, role-differentiated tips

</details>

---
*Last updated: 2026-04-19 after v1.0 milestone archive*

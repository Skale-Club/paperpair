# PaperPair

## What This Is

PaperPair is a guided immigration document assistant for couples going through a marriage-based green card (Adjustment of Status) in the U.S. It walks the beneficiary and petitioner step-by-step through every form, document, and action required — from eligibility check through interview and approval — with checklist tracking, AI-assisted chat, and PDF form previews.

## Core Value

The applicant always knows exactly what to do next — no confusion, no missed steps, no wasted trips to the USCIS website.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Complete AOS timeline with per-step checklist tracking
- [ ] Document upload and management (gather evidence, organize files)
- [ ] Immigration form browser with PDF previews (I-130, I-130A, I-485, I-864, I-765, I-131, I-693)
- [ ] AI chat assistant for case-specific questions
- [ ] Interview preparation (practice questions, what to bring)
- [ ] User authentication (email/password + OAuth)
- [ ] Dashboard with overall progress tracking

### Out of Scope

- Multiple immigration case types (K-1, consular processing, DACA) — AOS only for v1
- Attorney-facing case management — individual self-filers only
- Real-time USCIS status API integration — links to myUSCIS, not direct API
- Mobile native app — web-first

## Context

- **Brownfield:** App already has significant code — auth, dashboard, forms browser, AI chat (Vercel AI SDK with OpenAI/Anthropic/Google), PDF viewer (pdfjs-dist v5), timeline component, document upload flow
- **Stack:** Next.js 15 App Router, TypeScript, Prisma + Supabase (PostgreSQL), Tailwind CSS, Vercel AI SDK
- **Existing phases in timeline:** 4-phase AOS timeline recently expanded to 19 sections with 150+ per-item checkboxes
- **Progress persistence:** Currently localStorage-based (no DB persistence yet for timeline state)
- **Target user:** Immigrant + U.S. citizen spouse filing AOS together, self-represented (no attorney)

## Constraints

- **Tech stack:** Next.js 15 + Supabase + Prisma — must stay within this stack
- **AOS only:** All content and flow is scoped to marriage-based Adjustment of Status for now
- **Vercel deployment:** App targets Vercel hosting; avoid long-running server processes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| localStorage for timeline progress | Quick to ship, no backend schema needed | — Pending |
| Vercel AI SDK multi-provider | Flexibility to switch models without code changes | ✓ Good |
| PDF form browser (no auto-fill yet) | Auto-fill is complex; show forms first, fill later | — Pending |
| AOS-only v1 scope | Deep quality over breadth | — Pending |

---
*Last updated: 2026-04-17 after initial project initialization*

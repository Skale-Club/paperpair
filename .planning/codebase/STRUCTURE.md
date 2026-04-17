# STRUCTURE
_Last updated: 2026-04-17_

## Directory Layout

```
paperpair/
├── prisma/                        # Database schema and migrations
│   ├── schema.prisma              # Prisma data model (PostgreSQL)
│   └── migrations/                # SQL migration history
├── public/
│   └── forms/                     # Public PDF form templates served statically
├── scripts/                       # One-off utility scripts
├── src/
│   ├── app/                       # Next.js App Router (pages + API routes)
│   │   ├── layout.tsx             # Root layout: Providers + ConditionalShell
│   │   ├── page.tsx               # Root redirect → /home
│   │   ├── globals.css            # Global styles (Tailwind base)
│   │   ├── (auth)/                # Route group — auth-related UI components only
│   │   │   └── auth-form.tsx      # Shared sign-in/sign-up form component
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts       # OAuth/magic-link callback; creates UserProfile
│   │   ├── login/                 # Public login page
│   │   ├── signup/                # Public signup page
│   │   ├── home/                  # Public marketing home page
│   │   ├── blogs/                 # Public blog listing and posts
│   │   ├── contact/               # Public contact page (CMS-backed)
│   │   ├── faq/                   # Public FAQ page
│   │   ├── guide/                 # Protected immigration guide (requires auth)
│   │   ├── chat/                  # AI chat page (protected)
│   │   ├── documentation-filling/ # Document filling wizard (protected)
│   │   │   ├── documents/
│   │   │   └── select-templates/
│   │   ├── dashboard/             # Main user dashboard (protected)
│   │   │   ├── layout.tsx         # Fetches case steps; renders DashboardShell
│   │   │   ├── page.tsx           # Dashboard home: progress, stats, fees, civil surgeon
│   │   │   ├── (panel)/           # Route group for step-wizard panels
│   │   │   │   ├── personal-info/ # Step 1: beneficiary details
│   │   │   │   ├── spouse-info/   # Step 2: petitioning spouse details
│   │   │   │   ├── marriage-details/ # Step 3: marriage information
│   │   │   │   ├── immigration-info/ # Step 4: entry history and status
│   │   │   │   ├── documents/     # Step 5: evidence upload
│   │   │   │   └── review/        # Step 6: final review
│   │   │   ├── control-center/    # User case control center
│   │   │   ├── documents/
│   │   │   │   └── gather/        # Document checklist
│   │   │   ├── evidence/
│   │   │   │   └── bona-fide/     # Bona-fide marriage evidence gallery
│   │   │   ├── forms/
│   │   │   │   ├── i485/          # I-485 form assistant
│   │   │   │   └── pack/[id]/     # Form pack viewer (dynamic route)
│   │   │   ├── interview/         # Interview prep
│   │   │   ├── my-forms/          # User's generated form downloads
│   │   │   ├── profile/           # User profile settings
│   │   │   ├── settings/          # Account settings
│   │   │   └── support/           # Support/help page
│   │   ├── admin/                 # Admin panel (requires ADMIN role)
│   │   │   ├── login/             # Admin login page
│   │   │   └── (panel)/           # Route group: admin panel sections
│   │   │       ├── layout.tsx     # Admin sidebar layout
│   │   │       ├── page.tsx       # Redirect to dashboard
│   │   │       ├── dashboard/     # Admin overview: stats, stuck users
│   │   │       ├── users/         # User list + [userId] detail
│   │   │       ├── documents/     # PDF template manager
│   │   │       ├── ai-keys/       # Provider API key management
│   │   │       ├── blogs/         # Blog post editor
│   │   │       ├── cms/           # CMS page editor
│   │   │       ├── audit-logs/    # Audit log viewer
│   │   │       ├── clients/       # Client management
│   │   │       └── preferences/   # Admin preferences
│   │   └── api/                   # Route Handlers (REST endpoints)
│   │       ├── chat/
│   │       │   └── route.ts       # POST: AI streaming chat + PDF generation
│   │       ├── dashboard/
│   │       │   ├── steps/
│   │       │   │   └── route.ts   # GET steps list; PATCH upsert step status/data
│   │       │   ├── upload/
│   │       │   │   └── route.ts   # POST multipart file upload → Supabase Storage
│   │       │   ├── pdf/[filename]/
│   │       │   │   └── route.ts   # GET serve generated PDF from private/generated/
│   │       │   └── settings/
│   │       │       └── route.ts   # GET/PATCH user settings
│   │       ├── profile/
│   │       │   └── avatar/
│   │       │       └── route.ts   # POST avatar upload → Supabase Storage
│   │       ├── invite/
│   │       │   └── spouse/
│   │       │       └── route.ts   # POST create spouse invite and send email
│   │       ├── passkeys/          # WebAuthn (SimpleWebAuthn) endpoints
│   │       │   ├── register/
│   │       │   │   ├── options/route.ts   # POST generate registration options
│   │       │   │   └── verify/route.ts    # POST verify registration
│   │       │   └── auth/
│   │       │       ├── options/route.ts   # POST generate authentication options
│   │       │       └── verify/route.ts    # POST verify authentication
│   │       ├── civil-surgeons/
│   │       │   └── route.ts       # GET civil surgeon list by zip (static MA data)
│   │       ├── docs/
│   │       │   └── route.ts       # GET document template listing
│   │       └── admin/
│   │           ├── ai-keys/
│   │           │   └── route.ts   # GET/POST/DELETE admin AI provider keys
│   │           ├── users/
│   │           │   ├── route.ts   # GET/PATCH user admin operations
│   │           │   └── nudge/
│   │           │       └── route.ts  # POST send re-engagement email to user
│   │           ├── documents/
│   │           │   └── route.ts   # GET/POST/DELETE PDF templates
│   │           ├── blogs/
│   │           │   └── route.ts   # GET/POST/DELETE blog posts via Prisma
│   │           └── cms/
│   │               └── route.ts   # GET/POST CMS page content
│   ├── components/                # Shared React components
│   │   ├── ui/                    # Primitive UI components (buttons, cards, etc.)
│   │   ├── chat/                  # Chat UI component family
│   │   │   ├── index.ts           # Barrel export
│   │   │   ├── chat-container.tsx # Root chat layout
│   │   │   ├── chat-input.tsx     # Message input bar
│   │   │   ├── chat-message.tsx   # Individual message bubble
│   │   │   ├── chat-panel.tsx     # Chat panel wrapper
│   │   │   ├── generated-files-list.tsx # Shows generated PDF links
│   │   │   ├── intake-summary.tsx # Extracted data summary panel
│   │   │   ├── pdf-viewer.tsx     # In-chat PDF viewer
│   │   │   ├── template-selector.tsx # Form template picker
│   │   │   └── types.ts           # Chat component TypeScript types
│   │   ├── chat-ui.tsx            # Top-level chat UI (AI SDK useChat integration)
│   │   ├── dashboard-shell.tsx    # Authenticated layout wrapper with sidebar
│   │   ├── dashboard-sidebar.tsx  # Left navigation sidebar
│   │   ├── dashboard-timeline-sidebar.tsx # Timeline progress sidebar
│   │   ├── dashboard-step-form.tsx # Generic step form component
│   │   ├── dashboard-quick-rail.tsx # Quick action rail
│   │   ├── dashboard-general-menu.tsx # General menu in dashboard
│   │   ├── admin-sidebar.tsx      # Admin panel sidebar
│   │   ├── admin-blog-editor.tsx  # Blog post WYSIWYG editor
│   │   ├── admin-cms-editor.tsx   # CMS page content editor
│   │   ├── admin-docs-manager.tsx # Document template manager UI
│   │   ├── admin-users-table.tsx  # Admin user list table
│   │   ├── case-profile-card.tsx  # User case summary card
│   │   ├── case-health-topbar.tsx # Case health/status top bar
│   │   ├── civil-surgeon-widget.tsx # I-693 civil surgeon finder
│   │   ├── evidence-wall.tsx      # Bona-fide evidence gallery
│   │   ├── bona-fide-gallery.tsx  # Gallery for marriage evidence
│   │   ├── initial-screener.tsx   # Onboarding screener form
│   │   ├── screener-mount.tsx     # Client mount wrapper for screener
│   │   ├── my-case-timeline.tsx   # Case timeline visualization
│   │   ├── control-preferences-panel.tsx # User preferences panel
│   │   ├── conditional-shell.tsx  # Conditionally renders navbar
│   │   ├── navbar.tsx             # Public/authenticated top navbar
│   │   ├── language-switcher.tsx  # EN/PT language toggle
│   │   ├── logout-button.tsx      # Sign-out button
│   │   ├── passkey-prompt.tsx     # WebAuthn passkey registration prompt
│   │   ├── pdf-modal.tsx          # PDF viewer modal
│   │   ├── pdf-preview.tsx        # Inline PDF preview
│   │   ├── pdf-viewer.tsx         # Full PDF viewer component
│   │   ├── secure-route-lock.tsx  # Client-side biometric gate for sensitive docs
│   │   ├── split-screen-intake.tsx # Two-column intake layout
│   │   └── providers.tsx          # Context providers wrapper (LanguageProvider)
│   ├── contexts/
│   │   └── language-context.tsx   # React context for EN/PT language toggle
│   ├── content/
│   │   └── guides/                # Static markdown guide content
│   ├── lib/                       # Shared server-side utilities
│   │   ├── prisma.ts              # Singleton PrismaClient
│   │   ├── current-user-profile.ts # Auth+profile lookup; UserProfile upsert
│   │   ├── dashboard-steps.ts     # Canonical 6-step case definition
│   │   ├── case-step-data.ts      # Type-safe JSON data accessor for CaseStep.data
│   │   ├── pdf.ts                 # pdf-lib form fill utilities
│   │   ├── rate-limit.ts          # In-memory sliding-window rate limiter
│   │   ├── secret-crypto.ts       # AES-256-GCM encrypt/decrypt for AI keys
│   │   ├── fee-schedule.ts        # 2026 USCIS fee constants
│   │   ├── cms.ts                 # CMS slug helpers and defaults
│   │   ├── form-packs.ts          # Form pack definitions
│   │   ├── translations.ts        # EN/PT translation strings
│   │   ├── utils.ts               # General utility functions
│   │   ├── admin.ts               # Admin-specific helpers
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser-side Supabase client
│   │   │   ├── server.ts          # Server-side Supabase client (SSR cookie-based)
│   │   │   ├── admin.ts           # Service-role Supabase client
│   │   │   ├── middleware.ts      # Edge Supabase client for middleware
│   │   │   └── user-ai-keys.ts    # Fetch user's personal Google API key
│   │   └── ai/
│   │       ├── providers.ts       # LLM provider factory (Google, OpenAI, OpenRouter)
│   │       ├── models.ts          # Allowed model registry and metadata
│   │       ├── prompts.ts         # System prompts for immigration intake
│   │       └── tools/
│   │           ├── index.ts       # AI tool exports
│   │           └── generate-pdfs.ts # AI tool: PDF generation from structured data
│   ├── types/
│   │   └── supabase.ts            # Generated Supabase TypeScript types
│   ├── __tests__/
│   │   └── lib/                   # Unit tests for lib utilities
│   └── middleware.ts              # Next.js Edge middleware (auth guard + routing)
├── USCIS Forms/                   # Source USCIS PDF form files (reference copies)
├── plan/                          # Planning documents
├── supabase/                      # Supabase local config
├── next.config.mjs                # Next.js config (security headers, server actions)
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript config (path alias: @/ → src/)
├── vitest.config.ts               # Vitest test configuration
├── prisma/schema.prisma           # Database schema
└── package.json                   # Dependencies and scripts
```

---

## Directory Purposes

**`src/app/`:**
- The entire Next.js App Router tree
- Route groups `(auth)` and `(panel)` are organizational only — they do not affect URL paths
- Every `page.tsx` is a Server Component by default
- `layout.tsx` files establish nested shell components

**`src/app/api/`:**
- All REST Route Handlers; no tRPC or GraphQL
- Follow pattern: auth check → Zod validation → Prisma/Supabase operation → JSON response
- Admin routes additionally require `role === "ADMIN"`

**`src/app/dashboard/(panel)/`:**
- The 6-step case wizard panels: `personal-info`, `spouse-info`, `marriage-details`, `immigration-info`, `documents`, `review`
- Each step reads/writes a `CaseStep` record via `/api/dashboard/steps`

**`src/components/chat/`:**
- Self-contained chat feature; main entry is `chat-ui.tsx` using Vercel AI SDK `useChat`
- Barrel-exported from `index.ts`

**`src/lib/`:**
- Pure server-side utilities; do not import `"use client"` code
- `supabase/` sub-directory has four distinct clients for different runtime contexts

**`src/lib/ai/`:**
- Multi-provider LLM abstraction; provider selection by `"{provider}/{model}"` string
- `tools/` contains AI SDK tool definitions (currently: PDF generation)

**`prisma/`:**
- Schema has 6 models: `UserProfile`, `CaseStep`, `SpouseInvite`, `AiProviderKey`, `DocumentTemplate`, `PageContent`
- Migrations tracked in `prisma/migrations/`

---

## Naming Conventions

**Files:**
- Pages: `page.tsx` (always)
- Layouts: `layout.tsx` (always)
- Route Handlers: `route.ts` (always)
- Components: kebab-case `.tsx` (e.g., `dashboard-shell.tsx`)
- Library modules: kebab-case `.ts` (e.g., `current-user-profile.ts`)

**Directories:**
- Route groups: parentheses `(group-name)` (e.g., `(panel)`, `(auth)`)
- Dynamic segments: brackets `[param]` (e.g., `[userId]`, `[filename]`, `[id]`)
- Feature directories: kebab-case (e.g., `dashboard-steps`, `civil-surgeons`)

---

## Where to Add New Code

**New dashboard step:**
- Page: `src/app/dashboard/(panel)/{step-slug}/page.tsx`
- Add step definition to `src/lib/dashboard-steps.ts` (DASHBOARD_STEPS array)
- Step data accessed/written via existing `/api/dashboard/steps` PATCH endpoint

**New API endpoint:**
- Create `src/app/api/{feature}/route.ts`
- Start with auth check: `const context = await getCurrentUserAndProfile(); if (!context) return 401`
- Use Zod for body validation before any DB operation

**New admin page:**
- Page: `src/app/admin/(panel)/{section}/page.tsx`
- Add to admin sidebar: `src/components/admin-sidebar.tsx`
- API: `src/app/api/admin/{section}/route.ts`

**New shared component:**
- Place in `src/components/{component-name}.tsx`
- If part of a feature family (e.g., chat), place in `src/components/{feature}/`

**New library utility:**
- Place in `src/lib/{utility-name}.ts`
- If Supabase-specific: `src/lib/supabase/{utility}.ts`
- If AI-specific: `src/lib/ai/{utility}.ts`

**New database model:**
- Add to `prisma/schema.prisma`
- Run `npx prisma migrate dev --name {migration-name}`
- Import via `import { prisma } from "@/lib/prisma"`

---

## Special Directories

**`private/generated/`:**
- Purpose: Server-generated filled PDFs written by `/api/chat` route
- Generated: Yes (at runtime)
- Committed: No (gitignored)
- Served via: `GET /api/dashboard/pdf/[filename]`

**`public/forms/`:**
- Purpose: Blank USCIS PDF form templates served as static assets
- Generated: No (manually placed)
- Committed: Yes

**`USCIS Forms/`:**
- Purpose: Reference copies of source USCIS form PDFs and instructions
- Generated: No
- Committed: Yes (reference only, not served directly)

**`supabase/`:**
- Purpose: Supabase CLI local development configuration
- Generated: Partly (by Supabase CLI)
- Committed: Yes (config, not secrets)

**`.planning/`:**
- Purpose: GSD planning documents for AI-assisted development
- Generated: Yes (by map-codebase agent)
- Committed: Yes

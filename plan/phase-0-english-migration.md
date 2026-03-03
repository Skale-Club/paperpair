# Phase 0 · English Migration

## Objective
The codebase was originally built in Portuguese. Every user-facing string must be converted to English before building new features, so the product is consistent throughout.

---

## Checklist
- [x] Sidebar nav labels
- [x] Dashboard page headings + body text
- [x] Form labels, step names, status badges
- [x] Settings, profile, and support pages
- [x] Navbar links and mobile menu
- [x] Admin panel labels
- [x] Error/success messages and toasts
- [x] Root `layout.tsx` metadata

---

## Files to Update

| File | What to translate |
|------|-------------------|
| `src/components/dashboard-sidebar.tsx` | Menu item labels (Meu Processo → My Case, Documentação → Documentation, etc.) |
| `src/components/navbar.tsx` | "Contato" → Contact, "Meu Painel" → My Dashboard |
| `src/app/dashboard/page.tsx` | "Olá" greeting, "Progresso Geral", "Concluídas", "Em Andamento", "Pendentes", "Detalhamento por Etapa" |
| `src/app/dashboard/(panel)/personal-info/page.tsx` | All form labels |
| `src/app/dashboard/(panel)/marriage-details/page.tsx` | All form labels |
| `src/app/dashboard/(panel)/spouse-info/page.tsx` | All form labels |
| `src/app/dashboard/(panel)/immigration-info/page.tsx` | All form labels |
| `src/app/dashboard/(panel)/documents/page.tsx` | All labels |
| `src/app/dashboard/(panel)/review/page.tsx` | All labels |
| `src/app/dashboard/autoajuda/page.tsx` | Rename route to `/dashboard/support` or translate all content |
| `src/app/dashboard/settings/page.tsx` | All settings labels |
| `src/app/dashboard/profile/page.tsx` | All profile labels |
| `src/components/dashboard-step-form.tsx` | Step descriptions and button labels |
| `src/components/dashboard-timeline-sidebar.tsx` | Timeline step labels |
| `src/components/chat-ui.tsx` | Any hardcoded Portuguese UI strings |
| `src/lib/dashboard-steps.ts` | Step titles and descriptions |
| `src/app/layout.tsx` | metadata title + description |

---

## Translation Reference (key strings)

| Portuguese | English |
|-----------|---------|
| Meu Processo | My Case |
| Documentação | Documentation |
| Guia / Autoajuda | Support / Help |
| Perfil | Profile |
| Configurações | Settings |
| Painel Administrativo | Admin Panel |
| Progresso Geral | Overall Progress |
| Concluídas | Completed |
| Em Andamento | In Progress |
| Pendentes | Pending |
| Etapas concluídas | steps completed |
| Detalhamento por Etapa | Step Breakdown |
| Olá | Hello |
| Usuário | User |
| Contato | Contact |
| Meu Painel | My Dashboard |

---

## Acceptance Criteria
- [ ] `grep -r "Meu\|Olá\|Concluí\|Andamento\|Penden\|Etapa\|Configur\|Perfil\|Ajuda\|Documen" src/` returns zero results in user-facing components
- [ ] All pages readable by an English-only speaker without confusion

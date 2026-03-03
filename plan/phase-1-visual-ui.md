# Phase 1 · Visual & UI Standardization

## Objective
Establish the 2026 design system: Trust Blue palette, Inter typography, a collapsible left sidebar, and a sticky Case Health top bar. Every subsequent phase builds on this shell.

---

## Checklist (copy to `checklist.md` if tracking individually)
- [ ] `globals.css` — Trust Blue + Inter
- [ ] `layout.tsx` (root) — font + metadata
- [ ] `dashboard-sidebar.tsx` — rebuild
- [ ] `case-health-topbar.tsx` — new component
- [ ] `dashboard/layout.tsx` — mount topbar + new shell

---

## Step-by-Step Instructions

### Step 1 · `src/app/globals.css`
Add at the top (before `@tailwind base`):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```
Add inside `:root`:
```css
:root {
  --color-trust:   #1A365D;   /* Trust Blue primary */
  --color-trust-light: #2A4A7F;
  --color-trust-muted: #EBF0F8;
  --color-bg:      #F7FAFC;   /* Refined gray background */
  --color-surface: #FFFFFF;
  --color-border:  #E2E8F0;
  --color-muted:   #718096;
  font-family: 'Inter', system-ui, sans-serif;
}
```

### Step 2 · `src/app/layout.tsx`
- Update `<html>` to add `className="antialiased"`
- Update metadata: title → `"PaperPair | AI Case Manager"`, description → `"2026 concurrent I-130 + I-485 filing platform for mixed-status couples"`
- Ensure `<body>` has `style={{ background: 'var(--color-bg)' }}` or add `.bg-\[var(--color-bg)\]` via Tailwind

### Step 3 · `src/components/case-health-topbar.tsx`
**New Client Component.** Reads `completedSteps` / `totalSteps` from props.

UI layout:
```
[ PaperPair Logo ]  |  Case Health: ●● 68%  |  I-485: 14mo · I-130: 24mo  |  [Upload Evidence] [AI Assistant]
```
- Health score pill colors: ≥75% green, ≥40% amber, <40% red
- Sticky: `position: sticky; top: 0; z-index: 50`
- Background: `var(--color-trust)`, text white

### Step 4 · `src/components/dashboard-sidebar.tsx`
Rebuild with:
- **Width:** 240px expanded, 64px collapsed (toggle with a `<` / `>` chevron button)
- **Active state:** `background: var(--color-trust-muted); color: var(--color-trust); border-left: 3px solid var(--color-trust)`
- **Menu items:**

| Icon | Label | href |
|------|-------|------|
| 🏠 Home icon | Dashboard | `/dashboard` |
| 📁 Folder icon | Evidence | `/dashboard/evidence` |
| 📋 Form icon | Forms | `/dashboard/forms/i485` |
| 💬 Chat icon | AI Assistant | `/chat` |
| ❓ Help icon | Support | `/dashboard/autoajuda` |
| ⚙️ Gear icon | Settings | `/dashboard/settings` |

- Replace emoji with inline SVGs (Heroicons-style, 20×20)
- Collapsed state shows only icon; expanded shows icon + label
- `localStorage.setItem('sidebarCollapsed', 'true')` persists collapse state

### Step 5 · `src/app/dashboard/layout.tsx`
Replace current layout with:
```tsx
<div className="flex h-screen overflow-hidden">
  <DashboardSidebar />
  <div className="flex flex-1 flex-col overflow-auto">
    <CaseHealthTopbar completedSteps={completedSteps} totalSteps={totalSteps} />
    <main className="flex-1 p-6">{children}</main>
  </div>
</div>
```
- Remove the old `max-w-7xl` wrapper — let the sidebar + main fill the full viewport

---

## Acceptance Criteria
- [ ] Dashboard loads with Trust Blue sidebar on the left
- [ ] Sidebar collapses to 64px icon-only mode on toggle
- [ ] Top bar is sticky, shows Case Health pill
- [ ] Font is Inter throughout
- [ ] Background is `#F7FAFC` (not white)

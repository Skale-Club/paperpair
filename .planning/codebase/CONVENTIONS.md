# CONVENTIONS
_Last updated: 2026-04-17_

## Language & Toolchain

- **TypeScript** (strict mode, `"strict": true` in `tsconfig.json`) — `allowJs: false`, so no plain JS files in `src/`
- Target: `ES2022`; module resolution: `bundler`
- Path alias: `@/*` maps to `src/*` — use `@/` for all internal imports
- ESLint: `next/core-web-vitals` + `next/typescript` (configured in `.eslintrc.json`)
- No Prettier config present — formatting is unenforced beyond ESLint rules

## File Naming

- **Source files**: `kebab-case` for all filenames: `dashboard-shell.tsx`, `rate-limit.ts`, `fee-schedule.ts`
- **React component files**: `.tsx` extension; same kebab-case naming: `case-health-topbar.tsx`
- **Route files**: Next.js App Router conventions (`page.tsx`, `route.ts`, `layout.tsx`)
- **Test files**: `*.test.ts` or `*.test.tsx`, placed in `src/__tests__/` (not co-located)
- **Type-only files**: placed in `src/types/` (e.g., `src/types/supabase.ts`)

## Directory Layout Conventions

```
src/
  app/              # Next.js App Router — pages and API routes
    api/            # API Route handlers (route.ts files)
    (auth)/         # Route group (no URL segment)
    dashboard/
      (panel)/      # Route group for dashboard sub-pages
  components/       # Shared React components
    chat/           # Feature-scoped sub-directory
    ui/             # Primitive UI components (button, input, etc.)
  contexts/         # React context providers
  lib/              # Shared utility / business logic (no React)
    ai/             # AI-specific modules
      tools/        # AI tool definitions
    supabase/       # Supabase client factories
  types/            # Shared TypeScript types
  __tests__/        # All test files
    lib/            # Tests for src/lib modules
    setup.ts        # Global test setup
```

## Naming Patterns

**Components**: PascalCase named exports, matching the filename in PascalCase.
```typescript
// src/components/dashboard-shell.tsx
export function DashboardShell({ children, ... }: DashboardShellProps) { ... }
```

**Props types**: Defined inline with `type`, named `[ComponentName]Props`.
```typescript
type DashboardShellProps = {
  children: ReactNode;
  completedSteps: number;
  totalSteps: number;
  previewMode?: boolean;
};
```

**Hooks**: camelCase, prefixed with `use`:
```typescript
export function useLanguage() { return useContext(LanguageContext); }
```

**Constants**: `SCREAMING_SNAKE_CASE` for module-level constants:
```typescript
export const DASHBOARD_STEPS = [ ... ] as const;
export const FEES_2026_I485 = 1440;
export const CONCURRENT_BUNDLE_TOTAL = ...;
```

**Utility functions**: camelCase, descriptive verb-noun:
```typescript
export function sanitizeField(value: string | undefined, required = false): string
export function isDashboardStepSlug(value: string): value is DashboardStepSlug
export function getCurrentUserAndProfile()
```

**Types derived from `const` arrays**: Use `typeof` inference, not manual duplication:
```typescript
export type DashboardStep = (typeof DASHBOARD_STEPS)[number];
export type DashboardStepSlug = DashboardStep["slug"];
```

**Zod schemas**: camelCase with `Schema` suffix:
```typescript
const patchSchema = z.object({ ... });
const UIMessageSchema = z.object({ ... });
const BodySchema = z.object({ ... });
```

## Import Conventions

**Order** (no enforced grouping, but consistently observed):
1. External packages (`react`, `next/*`, `zod`, `ai`, etc.)
2. Internal `@/lib/*` modules
3. Internal `@/components/*`
4. Internal `@/types/*`
5. Relative imports (e.g., `./types`, `./chat-panel`)

**Type imports**: Use `import type` for type-only imports:
```typescript
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { Template, ChatMessage } from "./types";
```

**Mixing types and values**: Inline `type` keyword on named imports is acceptable:
```typescript
import { type Prisma, Role } from "@prisma/client";
import { type Lang } from "@/lib/translations";
```

## React Component Patterns

**Client components**: Mark with `"use client"` as the first line (before imports):
```typescript
"use client";
import { useEffect, useState } from "react";
```

**Server components**: No directive needed (default in App Router); async functions allowed:
```typescript
// src/app/dashboard/(panel)/personal-info/page.tsx — no directive
import { MyCaseTimeline } from "@/components/my-case-timeline";
export default function MyCasePage() { return <MyCaseTimeline />; }
```

**Thin page wrappers**: Route `page.tsx` files are thin; logic lives in a sibling component file:
```typescript
// page.tsx
import { LoginPage } from "./login-page";
export default function LoginRoute() { return <LoginPage />; }
```

**Default exports**: Only for Next.js page/route files. All other exports are named:
```typescript
// page.tsx → default export
export default function LoginRoute() { ... }

// components/*.tsx → named export
export function DashboardShell(...) { ... }
```

**JSX conditionals**: Use `? <Comp /> : null` rather than `&&` to avoid 0-rendering issues:
```typescript
{!previewMode ? <PasskeyPrompt /> : null}
```

**Supabase client in components**: Wrap `createClient()` in `useMemo` to avoid re-creation:
```typescript
const supabase = useMemo(() => createClient(), []);
```

## TypeScript Patterns

**Strict null safety**: Explicit `| null` on state and nullable values:
```typescript
const [error, setError] = useState<string | null>(null);
const [user, setUser] = useState<User | null>(null);
```

**Type narrowing with `as const`**: Applied to all literal arrays/objects that define slugs, enums, or step data:
```typescript
export const DASHBOARD_STEPS = [ ... ] as const;
```

**Avoid `any`**: Use `unknown` for untrusted input; cast via `as unknown as` for global augmentation:
```typescript
const globalRef = globalThis as unknown as { [KEY]?: Map<...> };
```

**Interface vs type**: `interface` used for shape-first object contracts (`FormItem`, `FormPack`); `type` used for unions, props, and aliases.

**JSDoc on public utilities**: Functions in `src/lib/` that have non-obvious behavior use full JSDoc with `@param`, `@returns`, `@throws`, and `@example`:
```typescript
/**
 * Sanitizes a field value for USCIS form submission.
 * @param value - The field value (may be undefined or empty)
 * @param required - Whether the field is required (default: false)
 */
export function sanitizeField(value: string | undefined, required = false): string
```

## API Route Conventions

- Handler functions named by HTTP method: `GET`, `POST`, `PATCH`, `DELETE`
- Always validate request bodies with Zod before processing
- Return `NextResponse.json({ error: "..." }, { status: NNN })` for errors
- Auth check first, return 401 immediately if no session:
```typescript
export async function GET() {
  const context = await getCurrentUserAndProfileWithCaseSteps();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ...
}
```

## Error Handling

- `try/catch` with empty `catch {}` used sparingly (only in Prisma upsert paths where a null return is acceptable)
- Errors from supabase/auth destructured with aliases to avoid shadowing: `const { error: signInError } = await ...`
- Rate limiting via `src/lib/rate-limit.ts` applied on sensitive API routes

## Styling

- Tailwind CSS utility classes; no CSS modules or styled-components
- `cn()` utility from `src/lib/utils.ts` for conditional class merging (`clsx` + `tailwind-merge`)
- Inline `style` props only for CSS variables: `style={{ background: "var(--color-bg)" }}`
- No global CSS beyond Tailwind base/utilities

## Module-Level Comments

- Module-level JSDoc block at top of complex lib files: `/** @module fee-schedule */`
- Inline `/** ... */` comments above each exported constant in `fee-schedule.ts`
- Regular `//` line comments inside function bodies for section explanations

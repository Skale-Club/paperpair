# TESTING
_Last updated: 2026-04-17_

## Test Framework

**Runner:** Vitest 4.x
- Config: `vitest.config.ts` (project root)
- Environment: `jsdom` (browser-like DOM for all tests)
- Globals: enabled (`describe`, `it`, `expect`, `vi` available without importing in test files — though explicit imports are used in this codebase)

**Assertion Library:** Vitest built-in (`expect`) + `@testing-library/jest-dom` matchers

**Component Testing:** `@testing-library/react` 16.x (installed, not yet used in test files)

**Run Commands:**
```bash
npm run test            # Watch mode (vitest)
npm run test:run        # Single run, no watch (vitest run)
npm run test:ui         # Browser-based UI (vitest --ui)
npm run test:coverage   # Coverage report (vitest run --coverage)
```

## Test File Organization

**Location:** All tests live in `src/__tests__/`, mirroring the `src/lib/` structure.

```
src/
  __tests__/
    setup.ts              # Global mock setup (runs before every test file)
    lib/
      fee-schedule.test.ts
      pdf.test.ts
```

**Naming:** `[module-name].test.ts` — matches the source filename without path prefix.

**Not co-located:** Test files are NOT placed alongside source files. All tests go into `src/__tests__/`.

**Include pattern** (from `vitest.config.ts`):
```
src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}
```

## Global Setup

**File:** `src/__tests__/setup.ts`

Loaded via `setupFiles` in `vitest.config.ts`. Provides global mocks for Supabase clients so no test accidentally hits the real database:

```typescript
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      // ... all auth methods mocked
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      // ... chaining mocks
    })),
  })),
}));

vi.mock("@/lib/supabase/server", () => ({ /* same pattern */ }));
```

Both `@/lib/supabase/client` and `@/lib/supabase/server` are mocked globally. Tests do NOT need to re-mock Supabase unless they need specific return values.

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from "vitest";
import { FEES_2026, CONCURRENT_BUNDLE_TOTAL } from "@/lib/fee-schedule";

describe("FEES_2026", () => {
  it("should have correct I-485 fee", () => {
    expect(FEES_2026.i485).toBe(1440);
  });

  it("should have I-131 included with I-485 (no extra fee)", () => {
    expect(FEES_2026.i131_with_i485).toBe(0);
  });
});
```

**Naming pattern:**
- `describe` block: name of the exported symbol being tested (function or constant name)
- `it` description: starts with `"should"`, plain English statement of expected behavior

**Imports:** Explicit (`import { describe, it, expect } from "vitest"`) even though globals are enabled.

## Mocking

**Framework:** Vitest's `vi.mock()` and `vi.fn()`

**Global mocks** (in `setup.ts`): Supabase client/server — applied to ALL tests automatically.

**Local mocks:** Not yet used in existing tests (pure unit tests don't require additional mocks).

**Mocking pattern for chained Supabase calls:**
```typescript
from: vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
})),
```
Use `mockReturnThis()` for chainable methods, `mockResolvedValue()` for terminal async calls.

## Coverage

**Provider:** `v8`
**Reporters:** `text` (terminal), `json`, `html`
**Exclusions:** `node_modules/`, `src/__tests__/`
**Threshold:** None configured — no minimum coverage requirement enforced.

```bash
npm run test:coverage   # Generates coverage/index.html and coverage-report.json
```

## What Is Tested

| Module | Test File | Coverage |
|--------|-----------|---------|
| `src/lib/fee-schedule.ts` | `src/__tests__/lib/fee-schedule.test.ts` | Exported constants and derived totals |
| `src/lib/pdf.ts` | `src/__tests__/lib/pdf.test.ts` | `lockFormEdition()`, `sanitizeField()` |

**fee-schedule tests** verify numeric correctness of USCIS fee constants and bundle totals.

**pdf tests** verify guard function throws on edition mismatch, and field sanitizer handles all input permutations (undefined, empty, whitespace, required vs optional).

## What Is NOT Tested (Coverage Gaps)

**High-priority gaps:**

- `src/lib/rate-limit.ts` — in-memory rate limiting logic; no tests for window/block behavior
- `src/lib/current-user-profile.ts` — upsert logic, viewer delegation, null handling
- `src/lib/dashboard-steps.ts` — `isDashboardStepSlug` type guard
- `src/lib/cms.ts` — blog slug normalization functions
- `src/lib/ai/providers.ts` — model routing and key cache invalidation
- `src/app/api/**/*.ts` — all API route handlers (no integration tests)
- `src/components/**/*.tsx` — all React components (no component tests, despite `@testing-library/react` being installed)
- `src/contexts/language-context.tsx` — context/hook behavior
- `src/lib/secret-crypto.ts` — encrypt/decrypt round-trip

**Summary:** Test coverage is minimal. Only two pure utility modules in `src/lib/` have tests. No component tests, no API route tests, no integration tests exist.

## Test Types

**Unit Tests:** Present — pure function testing for `src/lib/` utilities.

**Component Tests:** Not present — `@testing-library/react` is installed but unused.

**Integration Tests:** Not present — no API route or database integration tests.

**E2E Tests:** Not present — no Playwright, Cypress, or similar framework.

## Path Alias in Tests

The `@/` alias resolves correctly in tests via `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```
Use `@/lib/...`, `@/components/...` in test imports exactly as in source files.

## Adding New Tests

1. Create file at `src/__tests__/lib/[module-name].test.ts`
2. Import explicitly from `vitest`: `import { describe, it, expect } from "vitest"`
3. Import the module under test using the `@/` alias
4. Supabase is automatically mocked — no setup needed for lib functions that don't call Supabase directly
5. For component tests, import from `@testing-library/react`; render, query, assert with jest-dom matchers

**Example skeleton for a new lib test:**
```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "@/lib/my-module";

describe("myFunction", () => {
  it("should return expected value for valid input", () => {
    expect(myFunction("input")).toBe("expected");
  });

  it("should throw for invalid input", () => {
    expect(() => myFunction("bad")).toThrow("error message");
  });
});
```

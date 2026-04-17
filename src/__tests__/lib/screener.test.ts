/**
 * Screener contract tests — verifies that the EwiWarning component is exported
 * and that the screener's initial-screener module exports the expected symbols.
 *
 * Note: InitialScreener is a client component (modal wizard); its interactive
 * behavior is tested via E2E. This file validates the module surface.
 */
import { describe, it, expect } from "vitest";

describe("initial-screener module exports", () => {
  it("exports EwiWarning from initial-screener", async () => {
    // Dynamic import so vitest can tree-shake client components
    const mod = await import("@/components/initial-screener");
    expect(typeof mod.EwiWarning).toBe("function");
  });

  it("exports InitialScreener from initial-screener", async () => {
    const mod = await import("@/components/initial-screener");
    expect(typeof mod.InitialScreener).toBe("function");
  });
});

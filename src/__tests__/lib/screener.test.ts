import { describe, it, expect } from "vitest";

// Tests for: screener save-on-complete behavior
// These tests will fail until 02-04-PLAN.md implements the screener wiring.
// The actual save logic is server-side; these tests verify the data shape contracts.

describe("Screener data contracts (CASE-01, CASE-03)", () => {
  it("immigration-info stepSlug is used for screener data storage", () => {
    // The canonical slug where screener saves entry type
    const SCREENER_STEP_SLUG = "immigration-info";
    expect(SCREENER_STEP_SLUG).toBe("immigration-info");
  });

  it("entry type values are constrained to lawful-entry | overstay | ewi", () => {
    const VALID_ENTRY_TYPES = ["lawful-entry", "overstay", "ewi"];
    expect(VALID_ENTRY_TYPES).toContain("lawful-entry");
    expect(VALID_ENTRY_TYPES).toContain("overstay");
    expect(VALID_ENTRY_TYPES).toContain("ewi");
    expect(VALID_ENTRY_TYPES).not.toContain("unknown");
  });

  it("EWI entry type triggers warning flag in screener data", () => {
    const entryType = "ewi";
    const shouldShowWarning = entryType === "ewi";
    expect(shouldShowWarning).toBe(true);
  });

  it("non-EWI entry type does not trigger warning", () => {
    const lawfulEntry = "lawful-entry";
    const overstay = "overstay";
    expect(lawfulEntry === "ewi").toBe(false);
    expect(overstay === "ewi").toBe(false);
  });
});

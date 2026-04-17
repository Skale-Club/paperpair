import { describe, it, expect } from "vitest";
import { filterTimelineByEntryType } from "@/lib/timeline-checklists";

// Tests for: entry-type based timeline filtering
// These tests FAIL until 02-04-PLAN.md exports filterTimelineByEntryType.

describe("Timeline entry-type filter (CASE-02)", () => {
  it("filterTimelineByEntryType is exported from timeline-checklists", () => {
    expect(typeof filterTimelineByEntryType).toBe("function");
  });

  it("lawful-entry users receive the standard timeline without EWI-specific sections", () => {
    const sections = filterTimelineByEntryType("lawful-entry");
    const hasEwiSection = sections.some(s => s.id === "ewi-consult");
    expect(hasEwiSection).toBe(false);
  });

  it("ewi users receive EWI-specific sections in the timeline", () => {
    const sections = filterTimelineByEntryType("ewi");
    const hasEwiSection = sections.some(s => s.id === "ewi-consult");
    expect(hasEwiSection).toBe(true);
  });

  it("overstay users receive overstay-specific sections", () => {
    const sections = filterTimelineByEntryType("overstay");
    const hasOverstaySection = sections.some(s => s.id === "ewi-consult");
    // overstay also shows the consult section (same as EWI)
    expect(hasOverstaySection).toBe(true);
  });

  it("null/undefined entry type returns full timeline (no filter)", () => {
    const sections = filterTimelineByEntryType(null);
    expect(sections.length).toBeGreaterThan(0);
  });
});

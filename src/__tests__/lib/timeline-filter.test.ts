import { describe, it, expect } from "vitest";
import { filterTimelineByEntryType, TIMELINE_SECTIONS } from "@/lib/timeline-checklists";

describe("filterTimelineByEntryType", () => {
  it("returns sections WITHOUT ewi-consult for lawful-entry", () => {
    const sections = filterTimelineByEntryType("lawful-entry");
    const ids = sections.map((s) => s.id);
    expect(ids).not.toContain("ewi-consult");
  });

  it("returns sections INCLUDING ewi-consult for ewi", () => {
    const sections = filterTimelineByEntryType("ewi");
    const ids = sections.map((s) => s.id);
    expect(ids).toContain("ewi-consult");
  });

  it("returns sections INCLUDING ewi-consult for overstay", () => {
    const sections = filterTimelineByEntryType("overstay");
    const ids = sections.map((s) => s.id);
    expect(ids).toContain("ewi-consult");
  });

  it("returns full TIMELINE_SECTIONS unfiltered for null", () => {
    const sections = filterTimelineByEntryType(null);
    expect(sections).toEqual(TIMELINE_SECTIONS);
  });

  it("returns full TIMELINE_SECTIONS unfiltered for undefined", () => {
    const sections = filterTimelineByEntryType(undefined);
    expect(sections).toEqual(TIMELINE_SECTIONS);
  });

  it("ewi-consult section has title 'Consult an Immigration Attorney'", () => {
    const sections = filterTimelineByEntryType("ewi");
    const ewiSection = sections.find((s) => s.id === "ewi-consult");
    expect(ewiSection).toBeDefined();
    expect(ewiSection?.title).toBe("Consult an Immigration Attorney");
  });

  it("ewi-consult section appears as the FIRST item for EWI users", () => {
    const sections = filterTimelineByEntryType("ewi");
    expect(sections[0].id).toBe("ewi-consult");
  });

  it("ewi-consult section appears as the FIRST item for overstay users", () => {
    const sections = filterTimelineByEntryType("overstay");
    expect(sections[0].id).toBe("ewi-consult");
  });

  it("returns same count as TIMELINE_SECTIONS for lawful-entry (no extra sections)", () => {
    const sections = filterTimelineByEntryType("lawful-entry");
    expect(sections.length).toBe(TIMELINE_SECTIONS.length);
  });

  it("returns one extra section compared to TIMELINE_SECTIONS for ewi", () => {
    const sections = filterTimelineByEntryType("ewi");
    expect(sections.length).toBe(TIMELINE_SECTIONS.length + 1);
  });
});

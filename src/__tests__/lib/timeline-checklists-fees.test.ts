import { SECTION_CHECKLISTS } from "@/lib/timeline-checklists";

describe("timeline-checklists fee amounts", () => {
  it("i130-9 label contains $535 not $675", () => {
    const item = SECTION_CHECKLISTS["form-i130"].find((i) => i.id === "i130-9");
    expect(item?.label).toContain("$535");
    expect(item?.label).not.toContain("$675");
  });

  it("i765-6 label contains $260", () => {
    const item = SECTION_CHECKLISTS["form-i765-i131"].find((i) => i.id === "i765-6");
    expect(item?.label).toContain("$260");
  });

  it("no item label contains the wrong $675 amount", () => {
    const allLabels = Object.values(SECTION_CHECKLISTS).flat().map((i) => i.label);
    allLabels.forEach((label) => {
      expect(label).not.toContain("$675");
    });
  });
});

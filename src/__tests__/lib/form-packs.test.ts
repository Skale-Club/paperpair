import { describe, it, expect } from "vitest";
import { FORM_PACKS } from "@/lib/form-packs";

const EXPECTED_EDITIONS: Record<string, string> = {
  "i130":  "2023-12-15",
  "i131":  "2024-04-01",
  "i485":  "2024-04-01",
  "i765":  "2024-04-01",
  "i864a": "2023-12-15",
};

describe("Form packs edition locks (BUG-09)", () => {
  it("all form packs have editionDate field", () => {
    for (const pack of FORM_PACKS) {
      expect(pack).toHaveProperty("editionDate");
      expect(typeof pack.editionDate).toBe("string");
    }
  });

  it("all form packs have lockedUntil field as a Date", () => {
    for (const pack of FORM_PACKS) {
      expect(pack.lockedUntil).toBeInstanceOf(Date);
    }
  });

  it.each(Object.entries(EXPECTED_EDITIONS))("pack %s has editionDate %s", (packId, expectedDate) => {
    const pack = FORM_PACKS.find(p => p.id === packId);
    expect(pack).toBeDefined();
    expect(pack?.editionDate).toBe(expectedDate);
  });
});

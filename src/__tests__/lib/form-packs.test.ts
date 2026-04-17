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

describe("Form pack uscisUrl field (FORM-04)", () => {
  it("all 6 form packs have a non-empty uscisUrl field", () => {
    expect(FORM_PACKS).toHaveLength(6);
    for (const pack of FORM_PACKS) {
      expect(pack).toHaveProperty("uscisUrl");
      expect(typeof (pack as { uscisUrl?: string }).uscisUrl).toBe("string");
      expect((pack as { uscisUrl?: string }).uscisUrl).toMatch(/^https:\/\/www\.uscis\.gov/);
    }
  });

  it("i130 pack uscisUrl points to correct USCIS form page", () => {
    const pack = FORM_PACKS.find(p => p.id === "i130");
    expect((pack as { uscisUrl?: string }).uscisUrl).toContain("uscis.gov");
  });
});

describe("Form pack instructions field (FORM-02)", () => {
  it("all 6 form packs have an instructions object with purpose, whoFills, whatToExpect", () => {
    for (const pack of FORM_PACKS) {
      const p = pack as { instructions?: { purpose: string; whoFills: string; whatToExpect: string } };
      expect(p).toHaveProperty("instructions");
      expect(typeof p.instructions?.purpose).toBe("string");
      expect(p.instructions?.purpose.length).toBeGreaterThan(10);
      expect(typeof p.instructions?.whoFills).toBe("string");
      expect(["Petitioner", "Beneficiary", "Both"]).toContain(p.instructions?.whoFills);
      expect(typeof p.instructions?.whatToExpect).toBe("string");
      expect(p.instructions?.whatToExpect.length).toBeGreaterThan(20);
    }
  });
});

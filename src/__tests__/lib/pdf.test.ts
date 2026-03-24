import { describe, it, expect } from "vitest";
import { VALID_I485_EDITION, lockFormEdition, sanitizeField } from "@/lib/pdf";

describe("lockFormEdition", () => {
  it("should not throw for valid I-485 edition", () => {
    expect(() => lockFormEdition(VALID_I485_EDITION)).not.toThrow();
  });

  it("should throw for invalid edition", () => {
    expect(() => lockFormEdition("01/01/24")).toThrow(
      "Form edition mismatch: expected 01/20/25, got 01/01/24"
    );
  });

  it("should throw for empty edition", () => {
    expect(() => lockFormEdition("")).toThrow(
      "Form edition mismatch: expected 01/20/25, got "
    );
  });
});

describe("sanitizeField", () => {
  it("should return trimmed value for non-empty string", () => {
    expect(sanitizeField("  hello  ")).toBe("hello");
  });

  it("should return N/A for undefined value (non-required)", () => {
    expect(sanitizeField(undefined)).toBe("N/A");
  });

  it("should return N/A for empty string (non-required)", () => {
    expect(sanitizeField("")).toBe("N/A");
  });

  it("should return N/A for whitespace-only string (non-required)", () => {
    expect(sanitizeField("   ")).toBe("N/A");
  });

  it("should return empty string for undefined value (required)", () => {
    expect(sanitizeField(undefined, true)).toBe("");
  });

  it("should return empty string for empty string (required)", () => {
    expect(sanitizeField("", true)).toBe("");
  });

  it("should return trimmed value for non-empty string (required)", () => {
    expect(sanitizeField("  value  ", true)).toBe("value");
  });
});

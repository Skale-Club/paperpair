import { describe, it, expect } from "vitest";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/document-types";

// Tests for: docType field extension to upload route
// DOCUMENT_TYPES is the canonical list; the upload route validates against it.
// These tests FAIL until 02-02-PLAN.md creates src/lib/document-types.ts.

describe("Upload docType field contract (DOC-01)", () => {
  it("DOCUMENT_TYPES is exported from document-types.ts", () => {
    expect(Array.isArray(DOCUMENT_TYPES)).toBe(true);
  });

  it("each entry has value and label fields", () => {
    for (const docType of DOCUMENT_TYPES) {
      expect(docType).toHaveProperty("value");
      expect(docType).toHaveProperty("label");
      expect(typeof docType.value).toBe("string");
      expect(typeof docType.label).toBe("string");
    }
  });

  it("docType value must be a valid DocumentType (no unknown strings allowed)", () => {
    const values = DOCUMENT_TYPES.map(d => d.value);
    expect(values).toContain("passport");
    expect(values).toContain("marriage-certificate");
    expect(values).toContain("other");
  });
});

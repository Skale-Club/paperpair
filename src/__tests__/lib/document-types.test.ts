import { describe, it, expect } from "vitest";
import { DOCUMENT_TYPES, EXTRACTABLE_DOC_TYPES } from "@/lib/document-types";

// Tests FAIL until 02-02-PLAN.md creates src/lib/document-types.ts.

describe("Document type enum completeness (DOC-02)", () => {
  const EXPECTED_TYPES = [
    "passport",
    "birth-certificate",
    "marriage-certificate",
    "divorce-decree",
    "i-94",
    "visa",
    "tax-return",
    "bank-statement",
    "employment-letter",
    "police-clearance",
    "medical-exam",
    "photo",
    "other",
  ];

  it("DOCUMENT_TYPES has all 13 required entries", () => {
    expect(DOCUMENT_TYPES).toHaveLength(13);
  });

  it.each(EXPECTED_TYPES)("document type '%s' is present", (expectedType) => {
    const values = DOCUMENT_TYPES.map(d => d.value);
    expect(values).toContain(expectedType);
  });

  it("EXTRACTABLE_DOC_TYPES contains passport, marriage-certificate, birth-certificate", () => {
    expect(EXTRACTABLE_DOC_TYPES).toContain("passport");
    expect(EXTRACTABLE_DOC_TYPES).toContain("marriage-certificate");
    expect(EXTRACTABLE_DOC_TYPES).toContain("birth-certificate");
  });

  it("EXTRACTABLE_DOC_TYPES is a subset of DOCUMENT_TYPES values", () => {
    const allValues = DOCUMENT_TYPES.map(d => d.value);
    for (const extractable of EXTRACTABLE_DOC_TYPES) {
      expect(allValues).toContain(extractable);
    }
  });
});

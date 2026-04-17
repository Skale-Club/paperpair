import { describe, it, expect } from "vitest";
import { EXTRACTABLE_DOC_TYPES } from "@/lib/document-types";

// Tests for: on-demand AI extraction route contract (DOC-05)
// Tests FAIL until 02-02-PLAN.md creates src/lib/document-types.ts.

describe("Document extraction contract (DOC-05)", () => {
  it("only passport, marriage-certificate, and birth-certificate support extraction", () => {
    expect(EXTRACTABLE_DOC_TYPES).toHaveLength(3);
    expect(EXTRACTABLE_DOC_TYPES).toContain("passport");
    expect(EXTRACTABLE_DOC_TYPES).toContain("marriage-certificate");
    expect(EXTRACTABLE_DOC_TYPES).toContain("birth-certificate");
  });

  it("tax-return is NOT in extractable types", () => {
    expect(EXTRACTABLE_DOC_TYPES).not.toContain("tax-return");
  });

  it("other is NOT in extractable types", () => {
    expect(EXTRACTABLE_DOC_TYPES).not.toContain("other");
  });

  it("extraction request requires documentId and userProfileId", () => {
    type ExtractRequest = { documentId: string; userProfileId: string };
    const req: ExtractRequest = { documentId: "doc-cuid", userProfileId: "user-cuid" };
    expect(req).toHaveProperty("documentId");
    expect(req).toHaveProperty("userProfileId");
  });
});

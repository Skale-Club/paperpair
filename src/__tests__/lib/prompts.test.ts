import { describe, it, expect } from "vitest";
import { systemPrompt } from "@/lib/ai/prompts";

describe("systemPrompt legal guardrail (BUG-07)", () => {
  it("contains legal deflection response text", () => {
    expect(systemPrompt).toContain("I can't provide legal advice on that");
  });
  it("references uscis.gov", () => {
    expect(systemPrompt).toContain("uscis.gov");
  });
  it("contains UPL disclaimer text", () => {
    expect(systemPrompt).toContain("PaperPair provides general information only");
  });
});

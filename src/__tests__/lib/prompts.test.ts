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

describe("AP travel warning in systemPrompt (CHAT-06)", () => {
  it("systemPrompt contains Advance Parole warning instruction", () => {
    expect(systemPrompt.toUpperCase()).toContain("ADVANCE PAROLE");
  });

  it("systemPrompt warns against traveling without AP approval", () => {
    expect(systemPrompt).toContain("I-485");
  });

  it("AP warning mentions I-131 form", () => {
    expect(systemPrompt).toContain("I-131");
  });
});

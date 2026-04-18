import { describe, it, expect } from "vitest";
import { isDashboardStepSlug } from "@/lib/dashboard-steps";

describe("isDashboardStepSlug", () => {
  it("accepts income-calculator after slug addition", () => {
    expect(isDashboardStepSlug("income-calculator")).toBe(true);
  });
  it("still accepts existing slugs", () => {
    expect(isDashboardStepSlug("review")).toBe(true);
    expect(isDashboardStepSlug("personal-info")).toBe(true);
  });
  it("rejects unknown slugs", () => {
    expect(isDashboardStepSlug("unknown-slug")).toBe(false);
  });
});

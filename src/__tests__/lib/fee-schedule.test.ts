import { describe, it, expect } from "vitest";
import { FEES_2026, CONCURRENT_BUNDLE_TOTAL } from "@/lib/fee-schedule";

describe("FEES_2026", () => {
  it("should have correct I-485 fee", () => {
    expect(FEES_2026.i485).toBe(1440);
  });

  it("should have I-131 included with I-485 (no extra fee)", () => {
    expect(FEES_2026.i131_with_i485).toBe(0);
  });

  it("should have correct EAD initial fee", () => {
    expect(FEES_2026.ead_initial).toBe(260);
  });

  it("should have correct I-130 paper fee", () => {
    expect(FEES_2026.i130_paper).toBe(535);
  });

  it("should have correct I-130 online fee", () => {
    expect(FEES_2026.i130_online).toBe(535);
  });

  it("should have biometrics waived", () => {
    expect(FEES_2026.biometrics).toBe(0);
  });
});

describe("CONCURRENT_BUNDLE_TOTAL", () => {
  it("should be sum of I-130 + I-485 + EAD", () => {
    expect(CONCURRENT_BUNDLE_TOTAL).toBe(535 + 1440 + 260);
  });

  it("should equal $2,235", () => {
    expect(CONCURRENT_BUNDLE_TOTAL).toBe(2235);
  });
});

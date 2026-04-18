import { describe, it, expect } from "vitest";
import { POVERTY_GUIDELINES_2026, get125PercentThreshold } from "@/lib/poverty-guidelines";

describe("POVERTY_GUIDELINES_2026", () => {
  it("has correct baseAmount", () => {
    expect(POVERTY_GUIDELINES_2026.baseAmount).toBe(15960);
  });
  it("has correct perAdditionalPerson", () => {
    expect(POVERTY_GUIDELINES_2026.perAdditionalPerson).toBe(5680);
  });
});

describe("get125PercentThreshold", () => {
  const cases: [number, number][] = [
    [1, 19950], [2, 27050], [3, 34150], [4, 41250],
    [5, 48350], [6, 55450], [7, 62550], [8, 69650],
  ];
  it.each(cases)("household size %i → $%i", (size, expected) => {
    expect(get125PercentThreshold(size)).toBe(expected);
  });
});

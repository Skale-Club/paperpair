import { describe, it, expect } from "vitest";
import { FEES_2026_I130_PAPER, FEES_2026_I485, FEES_2026_I765_EAD_INITIAL } from "@/lib/fee-schedule";

describe("my-case-timeline filing fee note", () => {
  it("I-130 fee constant is $535", () => {
    expect(FEES_2026_I130_PAPER).toBe(535);
  });

  it("I-485 fee constant is $1440", () => {
    expect(FEES_2026_I485).toBe(1440);
  });

  it("I-765 fee constant is $260", () => {
    expect(FEES_2026_I765_EAD_INITIAL).toBe(260);
  });
});

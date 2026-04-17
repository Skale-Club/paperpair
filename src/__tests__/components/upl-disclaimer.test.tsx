import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UplDisclaimer } from "@/components/upl-disclaimer";

describe("UplDisclaimer (BUG-08)", () => {
  it("renders with role=note", () => {
    const { getByRole } = render(<UplDisclaimer />);
    expect(getByRole("note")).toBeTruthy();
  });
  it("renders the disclaimer lead text", () => {
    const { getByText } = render(<UplDisclaimer />);
    expect(getByText(/PaperPair provides general information only — not legal advice\./)).toBeTruthy();
  });
  it("renders the secondary sentence", () => {
    const { getByText } = render(<UplDisclaimer />);
    expect(getByText(/Always consult a qualified immigration attorney/)).toBeTruthy();
  });
});

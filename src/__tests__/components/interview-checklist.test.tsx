import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InterviewClient } from "@/app/dashboard/interview/interview-client";

describe("InterviewClient checklist", () => {
  it("all checklist checkboxes start unchecked on mount", () => {
    render(<InterviewClient userRole="USER" />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
    for (const checkbox of checkboxes) {
      expect((checkbox as HTMLInputElement).checked).toBe(false);
    }
  });

  it("clicking a single checkbox marks it checked", () => {
    render(<InterviewClient userRole="USER" />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
  });

  it("'ready for the interview' confirmation is NOT shown when not all items are checked", () => {
    render(<InterviewClient userRole="USER" />);
    const result = screen.queryByText(/ready for the interview/i);
    expect(result).toBeNull();
  });

  it("checking every checkbox causes 'you are ready for the interview' text to appear", () => {
    render(<InterviewClient userRole="USER" />);
    const checkboxes = screen.getAllByRole("checkbox");
    for (const checkbox of checkboxes) {
      fireEvent.click(checkbox);
    }
    expect(
      screen.getByText(/ready for the interview/i)
    ).toBeInTheDocument();
  });
});

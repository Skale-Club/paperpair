import { describe, it, expect } from "vitest";
import { INTERVIEW_QUESTIONS, CATEGORIES } from "@/lib/interview-questions";

const VALID_CATEGORIES = [
  "Relationship History",
  "Daily Life & Cohabitation",
  "Personal & Immigration History",
  "Forms & Documents",
] as const;

describe("INTERVIEW_QUESTIONS", () => {
  it("has between 28 and 32 items (inclusive)", () => {
    expect(INTERVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(28);
    expect(INTERVIEW_QUESTIONS.length).toBeLessThanOrEqual(32);
  });

  it("every question has non-empty string fields: id, category, question, answerTip", () => {
    for (const q of INTERVIEW_QUESTIONS) {
      expect(typeof q.id).toBe("string");
      expect(q.id.length).toBeGreaterThan(0);
      expect(typeof q.category).toBe("string");
      expect(q.category.length).toBeGreaterThan(0);
      expect(typeof q.question).toBe("string");
      expect(q.question.length).toBeGreaterThan(0);
      expect(typeof q.answerTip).toBe("string");
      expect(q.answerTip.length).toBeGreaterThan(0);
    }
  });

  it("every question.category is one of the 4 valid values", () => {
    for (const q of INTERVIEW_QUESTIONS) {
      expect(VALID_CATEGORIES).toContain(q.category);
    }
  });

  it("'Relationship History' category has at least 5 questions", () => {
    const count = INTERVIEW_QUESTIONS.filter(
      (q) => q.category === "Relationship History"
    ).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it("'Daily Life & Cohabitation' category has at least 5 questions", () => {
    const count = INTERVIEW_QUESTIONS.filter(
      (q) => q.category === "Daily Life & Cohabitation"
    ).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it("'Personal & Immigration History' category has at least 5 questions", () => {
    const count = INTERVIEW_QUESTIONS.filter(
      (q) => q.category === "Personal & Immigration History"
    ).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it("'Forms & Documents' category has at least 5 questions", () => {
    const count = INTERVIEW_QUESTIONS.filter(
      (q) => q.category === "Forms & Documents"
    ).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });
});

describe("CATEGORIES", () => {
  it("contains all 4 category strings plus 'All' (length 5)", () => {
    expect(CATEGORIES).toHaveLength(5);
    expect(CATEGORIES).toContain("All");
    for (const cat of VALID_CATEGORIES) {
      expect(CATEGORIES).toContain(cat);
    }
  });
});

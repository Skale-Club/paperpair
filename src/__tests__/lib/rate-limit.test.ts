import { describe, it, expect } from "vitest";
import { runRateLimit } from "@/lib/rate-limit";

describe("runRateLimit key format (BUG-10 documentation)", () => {
  it("accepts a user-ID-based key without throwing", () => {
    const result = runRateLimit({
      key: "chat:clx123abc",
      windowMs: 60_000,
      max: 30,
    });
    expect(result).toHaveProperty("ok");
    expect(result).toHaveProperty("remaining");
  });
  it("blocks after exceeding max requests", () => {
    const key = "chat:test-user-block-" + Date.now();
    for (let i = 0; i < 2; i++) {
      runRateLimit({ key, windowMs: 60_000, max: 2 });
    }
    const result = runRateLimit({ key, windowMs: 60_000, max: 2 });
    expect(result.ok).toBe(false);
  });
});

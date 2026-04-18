import { describe, it, expect } from "vitest";
import { getMagicMime } from "@/lib/mime";

// Tests import the PRODUCTION function from src/lib/mime.ts — not an inline copy.
describe("getMagicMime (BUG-11)", () => {
  it("detects PDF magic bytes", () => {
    expect(getMagicMime(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBe("application/pdf");
  });
  it("detects JPEG magic bytes", () => {
    expect(getMagicMime(new Uint8Array([0xFF, 0xD8, 0xFF]))).toBe("image/jpeg");
  });
  it("detects PNG magic bytes", () => {
    expect(getMagicMime(new Uint8Array([0x89, 0x50, 0x4E, 0x47]))).toBe("image/png");
  });
  it("returns null for unknown bytes", () => {
    expect(getMagicMime(new Uint8Array([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });
});

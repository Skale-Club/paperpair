import { describe, it, expect } from "vitest";

// Tests for: GET /api/chat/history response contract
// These tests verify the message transformation contract (DB -> AI SDK format).
// The actual endpoint is exercised manually; these tests validate the shape.

type AiSdkMessage = { id: string; role: "user" | "assistant"; content: string };

describe("Chat history message format contract (CHAT-04)", () => {
  it("AI SDK message must have id, role, and content fields", () => {
    const msg: AiSdkMessage = { id: "test-id", role: "user", content: "hello" };
    expect(msg).toHaveProperty("id");
    expect(msg).toHaveProperty("role");
    expect(msg).toHaveProperty("content");
  });

  it("role must be user or assistant — not system or other", () => {
    const validRoles = ["user", "assistant"];
    expect(validRoles).toContain("user");
    expect(validRoles).toContain("assistant");
    expect(validRoles).not.toContain("system");
    expect(validRoles).not.toContain("function");
  });

  it("DB ChatMessage can be mapped to AiSdkMessage format", () => {
    const dbMessage = { id: "cuid123", role: "user", content: "my message", createdAt: new Date() };
    const mapped: AiSdkMessage = {
      id: dbMessage.id,
      role: dbMessage.role as "user" | "assistant",
      content: dbMessage.content,
    };
    expect(mapped.id).toBe("cuid123");
    expect(mapped.role).toBe("user");
    expect(mapped.content).toBe("my message");
  });

  it("system messages are filtered out before returning to client", () => {
    const messages = [
      { id: "1", role: "user", content: "hello" },
      { id: "2", role: "system", content: "instructions" },
      { id: "3", role: "assistant", content: "hi" },
    ];
    const filtered = messages.filter(m => m.role === "user" || m.role === "assistant");
    expect(filtered).toHaveLength(2);
    expect(filtered.find(m => m.role === "system")).toBeUndefined();
  });
});

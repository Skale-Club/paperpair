import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import AuthForm from "@/app/(auth)/auth-form";

// Mock router and search params
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  }),
}));

describe("AuthForm color contract (AUTH-01/02)", () => {
  it("submit button uses trust color, not emerald-600", () => {
    const { container } = render(<AuthForm variant="signin" />);
    const buttons = container.querySelectorAll("button[type='submit']");
    for (const btn of buttons) {
      expect(btn.className).not.toContain("emerald-600");
      expect(btn.className).not.toContain("emerald-700");
    }
  });

  it("submit button contains trust color class", () => {
    const { container } = render(<AuthForm variant="signin" />);
    const submitBtn = container.querySelector("button[type='submit']");
    expect(submitBtn?.className).toContain("color-trust");
  });

  it("input focus uses trust color, not emerald-500", () => {
    const { container } = render(<AuthForm variant="signin" />);
    const inputs = container.querySelectorAll("input[type='email'], input[type='password']");
    for (const input of inputs) {
      expect(input.className).not.toContain("emerald-500");
    }
  });
});

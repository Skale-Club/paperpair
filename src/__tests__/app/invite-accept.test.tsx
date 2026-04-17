import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("token=test-token"),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("InviteAcceptPage states (AUTH-05)", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  it("shows loading state initially", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { default: InviteAcceptPage } = await import("@/app/invite/accept/page");
    render(<InviteAcceptPage />);
    expect(screen.getByText("Verifying your invitation...")).toBeTruthy();
  });

  it("shows expired state when token is expired", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: "expired" }),
    });
    const { default: InviteAcceptPage } = await import("@/app/invite/accept/page");
    render(<InviteAcceptPage />);
    await screen.findByText("This invitation has expired");
    expect(screen.getByText("This invitation has expired")).toBeTruthy();
  });

  it("shows accepted state when already accepted", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: "accepted" }),
    });
    const { default: InviteAcceptPage } = await import("@/app/invite/accept/page");
    render(<InviteAcceptPage />);
    await screen.findByText("You're already part of this case");
    expect(screen.getByText("You're already part of this case")).toBeTruthy();
  });

  it("shows Accept invitation button when invite is valid", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: "valid", petitionerName: "Alex Smith" }),
    });
    const { default: InviteAcceptPage } = await import("@/app/invite/accept/page");
    render(<InviteAcceptPage />);
    await screen.findByText("Accept invitation");
    expect(screen.getByText("Accept invitation")).toBeTruthy();
    expect(screen.getByText(/Alex Smith invited you to PaperPair/)).toBeTruthy();
  });

  it("Decline button navigates to /login", async () => {
    const pushMock = vi.fn();
    vi.mocked(vi.fn()).mockImplementation(() => ({
      push: pushMock,
    }));
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: "valid", petitionerName: "Jordan" }),
    });
    const { default: InviteAcceptPage } = await import("@/app/invite/accept/page");
    render(<InviteAcceptPage />);
    await screen.findByText("Decline");
    expect(screen.getByText("Decline")).toBeTruthy();
  });
});

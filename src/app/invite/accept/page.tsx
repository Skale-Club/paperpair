"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type InviteStatus =
  | { state: "loading" }
  | { state: "valid"; petitionerName: string }
  | { state: "expired" }
  | { state: "accepted" }
  | { state: "invalid" };

export default function InviteAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invite, setInvite] = useState<InviteStatus>({ state: "loading" });

  useEffect(() => {
    if (!token) {
      setInvite({ state: "invalid" });
      return;
    }
    fetch(`/api/invite/validate?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: { status: string; petitionerName?: string }) => {
        if (data.status === "valid" && data.petitionerName) {
          setInvite({ state: "valid", petitionerName: data.petitionerName });
        } else if (data.status === "accepted") {
          setInvite({ state: "accepted" });
        } else {
          setInvite({ state: "expired" });
        }
      })
      .catch(() => setInvite({ state: "invalid" }));
  }, [token]);

  return (
    <div className="mx-auto mt-12 flex max-w-4xl justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-sand-300 bg-white px-8 py-10 shadow-sm">
        {invite.state === "loading" && (
          <div aria-live="polite" className="text-center">
            <div
              className="animate-spin h-5 w-5 border-2 border-[var(--color-trust)] border-t-transparent rounded-full mx-auto"
              role="status"
              aria-label="Loading"
            />
            <p className="text-sm text-foreground/60 mt-4">Verifying your invitation...</p>
          </div>
        )}

        {invite.state === "valid" && (
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-trust-muted)] text-[var(--color-trust)] mx-auto">
              {/* Envelope icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-4">
              {invite.petitionerName} invited you to PaperPair
            </h1>
            <p className="text-sm text-foreground/60 mt-2">
              You&apos;re joining as the beneficiary spouse. Accept below to access your shared case.
            </p>
            <span className="inline-flex rounded-full px-3 py-1 text-xs bg-[var(--color-trust-muted)] text-[var(--color-muted)] mt-4">
              Beneficiary spouse
            </span>
            <button
              onClick={() => router.push(`/login?invite_token=${token ?? ""}`)}
              className="mt-6 w-full rounded-lg bg-[var(--color-trust)] px-4 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-trust)] focus-visible:ring-offset-2"
            >
              Accept invitation
            </button>
            <button
              onClick={() => router.push("/login")}
              className="mt-3 block w-full text-sm text-foreground/50 underline text-center"
            >
              Decline
            </button>
          </div>
        )}

        {(invite.state === "expired" || invite.state === "invalid") && (
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-8 w-8 text-red-500 mx-auto"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-xl font-bold text-foreground mt-4">This invitation has expired</h1>
            <p className="text-sm text-foreground/60 mt-2">
              Ask your spouse to send a new invite from their PaperPair settings.
            </p>
            <a href="/login" className="mt-4 inline-block text-sm text-[var(--color-trust)] underline">
              Go to sign in
            </a>
          </div>
        )}

        {invite.state === "accepted" && (
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">You&apos;re already part of this case</h1>
            <p className="text-sm text-foreground/60 mt-2">Sign in to access your dashboard.</p>
            <a href="/login" className="mt-4 inline-block text-sm text-[var(--color-trust)] underline">
              Sign in
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

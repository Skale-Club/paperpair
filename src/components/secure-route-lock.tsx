"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useEffect, useState, type ReactNode } from "react";

type Status = "loading" | "locked" | "verifying" | "unlocked" | "error" | "bypassed";

export function SecureRouteLock({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<Status>("loading");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const check = async () => {
            try {
                const settingsRes = await fetch("/api/dashboard/settings");
                const settings = (await settingsRes.json()) as {
                    requireBiometricsForSensitiveDocs?: boolean;
                };

                if (!settings.requireBiometricsForSensitiveDocs) {
                    setStatus("bypassed");
                    return;
                }

                // Check if user has passkeys registered
                if (!window.PublicKeyCredential) {
                    setStatus("bypassed");
                    return;
                }

                setStatus("locked");
            } catch {
                setStatus("bypassed");
            }
        };

        void check();
    }, []);

    const handleVerify = async () => {
        setStatus("verifying");
        setErrorMsg(null);

        try {
            const optsRes = await fetch("/api/passkeys/auth/options", {
                method: "POST"
            });

            if (!optsRes.ok) {
                const data = (await optsRes.json()) as { error?: string };
                if (data.error === "No passkeys registered") {
                    // User doesn't have passkeys, bypass the lock
                    setStatus("bypassed");
                    return;
                }
                throw new Error(data.error ?? "Could not start verification.");
            }

            const { options } = await optsRes.json();
            const authResponse = await startAuthentication(options);

            const verifyRes = await fetch("/api/passkeys/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(authResponse)
            });

            if (!verifyRes.ok) {
                throw new Error("Verification failed. Please try again.");
            }

            const result = (await verifyRes.json()) as { verified?: boolean };

            if (result.verified) {
                setStatus("unlocked");
            } else {
                throw new Error("Verification was not successful.");
            }
        } catch (err) {
            setStatus("error");
            setErrorMsg(
                err instanceof Error ? err.message : "Something went wrong. Please try again."
            );
        }
    };

    if (status === "loading") {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            </div>
        );
    }

    if (status === "unlocked" || status === "bypassed") {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-[400px] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                {/* Lock icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-slate-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                    Verify Identity
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    This section contains sensitive documents. Verify your identity using Face ID, Touch ID, or Windows Hello to continue.
                </p>

                {errorMsg && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMsg}
                    </div>
                )}

                <button
                    onClick={() => void handleVerify()}
                    disabled={status === "verifying"}
                    className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
                >
                    {status === "verifying" ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Verifying…
                        </span>
                    ) : status === "error" ? (
                        "Try Again"
                    ) : (
                        "Verify Identity to Access Sensitive Documents"
                    )}
                </button>

                <p className="mt-4 text-xs text-slate-400">
                    You can disable this lock in{" "}
                    <a href="/dashboard/settings" className="text-slate-600 underline underline-offset-2 hover:text-slate-900">
                        Settings → Security
                    </a>.
                </p>
            </div>
        </div>
    );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { startRegistration } from "@simplewebauthn/browser";
import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function PasskeyPrompt() {
  const supabase = createClient();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Only show if user has no passkeys and hasn't dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("passkeyDismissed");
    if (dismissed) return;

    const check = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { count } = await supabase
        .from("webauthn_credentials")
        .select("id", { count: "exact", head: true });
      if ((count ?? 0) === 0) {
        setVisible(true);
      }
    };
    void check();
  }, [supabase]);

  const hide = (persist = false) => {
    if (persist) {
      localStorage.setItem("passkeyDismissed", "true");
    }
    setVisible(false);
  };

  const handleEnroll = async () => {
    setStatus("loading");
    setMessage(null);

    if (!window.PublicKeyCredential) {
      setStatus("error");
      setMessage("Passkeys are not supported on this device/browser.");
      return;
    }

    try {
      const optsRes = await fetch("/api/passkeys/register/options", {
        method: "POST"
      });
      if (!optsRes.ok) {
        throw new Error("Could not start passkey setup.");
      }
      const { options } = await optsRes.json();

      const attestationResponse = await startRegistration(options);

      const verifyRes = await fetch("/api/passkeys/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attestationResponse)
      });

      if (!verifyRes.ok) {
        throw new Error("Passkey verification failed.");
      }

      setStatus("success");
      setMessage("Passkey added. Next time, you can use Face ID / Windows Hello here.");
      setTimeout(() => hide(true), 1500);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Something went wrong setting up your passkey."
      );
    }
  };

  if (!visible) return null;

  return (
    <div className="mb-6 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-emerald-600/90 px-2 py-1 text-xs font-semibold text-white">
          New
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Add Face ID / Touch ID / Windows Hello
          </p>
          <p className="text-sm text-foreground/70">
            Secure your account with a passkey on this device. You can still use Google, Microsoft, or password anytime.
          </p>
          {message && (
            <p
              className={`mt-2 text-sm ${
                status === "success" ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {message}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleEnroll}
              disabled={status === "loading"}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {status === "loading" ? "Setting up..." : "Enable passkey"}
            </button>
            <button
              onClick={() => hide(true)}
              className="rounded-lg border border-sand-300 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-sand-50"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

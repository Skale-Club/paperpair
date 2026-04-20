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
    <div className="mb-6 w-full rounded-2xl border border-olive-200/60 bg-olive-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-olive-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          New
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">
            Add Face ID / Touch ID / Windows Hello
          </p>
          <p className="text-sm text-slate-600">
            Secure your account with a passkey on this device. You can still use Google, Microsoft, or password anytime.
          </p>
          {message && (
            <p
              className={`mt-2 text-sm font-medium ${
                status === "success" ? "text-olive-700" : "text-red-700"
              }`}
            >
              {message}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleEnroll}
              disabled={status === "loading"}
              className="rounded-lg bg-olive-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-olive-700 disabled:opacity-60"
            >
              {status === "loading" ? "Setting up..." : "Enable passkey"}
            </button>
            <button
              onClick={() => hide(true)}
              className="rounded-lg border border-olive-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-olive-50 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

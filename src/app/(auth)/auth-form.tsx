"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Variant = "signin" | "signup";

type AuthFormProps = {
  variant: Variant;
  title?: string;
  description?: string;
  showOAuth?: boolean;
  showSwitchLink?: boolean;
};

export default function AuthForm({
  variant,
  title: titleOverride,
  description: descriptionOverride,
  showOAuth = true,
  showSwitchLink = true
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const oauthProviders = useMemo(
    () => [
      { id: "google", label: "Continue with Google" },
      {
        id: "azure",
        label: "Continue with Microsoft",
        helper: "Works for Outlook / Hotmail accounts"
      }
    ],
    []
  );

  const incomingError = searchParams.get("error");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const role = (data.user.app_metadata as { role?: string })?.role;
        router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
      }
    });
  }, [router, supabase]);

  useEffect(() => {
    if (incomingError === "auth") {
      setError("We couldn't finish signing you in. Please try again.");
    }
  }, [incomingError]);

  const handleOAuthLogin = async (provider: string) => {
    setError(null);
    setMessage(null);
    setOauthLoading(provider);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" }
      }
    });

    if (authError) {
      setError(authError.message);
      setOauthLoading(null);
    }
  };

  const handlePasswordAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setFormLoading(true);

    if (variant === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        router.push("/dashboard");
      } else {
        setMessage(
          "Check your email to confirm your account, then return here to sign in."
        );
      }
    }

    setFormLoading(false);
  };

  const title = titleOverride
    ? titleOverride
    : variant === "signin"
      ? "Sign in"
      : "Create your account";

  const description =
    descriptionOverride ||
    "Use Google or Microsoft, or continue with any email (Gmail, Yahoo, Hotmail, etc.).";
  const submitLabel = variant === "signin" ? "Sign in" : "Create account";
  const passwordAutocomplete =
    variant === "signin" ? "current-password" : "new-password";
  const switchLink =
    variant === "signin"
      ? { href: "/signup", text: "Need an account? Create one" }
      : { href: "/login", text: "Already have an account? Sign in" };

  return (
    <section className="mx-auto mt-16 max-w-md rounded-xl border border-sand-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
      <p className="mb-6 text-sm text-foreground/60">{description}</p>

      {(error || message) && (
        <div
          className={`mb-4 rounded-md border px-3 py-2 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || message}
        </div>
      )}

      <form className="mb-6 space-y-4" onSubmit={handlePasswordAuth}>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-sand-300 bg-white px-3 py-2 text-sm text-foreground shadow-inner focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            minLength={6}
            autoComplete={passwordAutocomplete}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-sand-300 bg-white px-3 py-2 text-sm text-foreground shadow-inner focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={formLoading}
          className="flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {formLoading ? "Working..." : submitLabel}
        </button>
      </form>

      {showOAuth && (
        <>
          <div className="mb-3 text-center text-xs uppercase tracking-wide text-foreground/50">
            Or continue with
          </div>

          <div className="space-y-3">
            {oauthProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOAuthLogin(provider.id)}
                disabled={Boolean(oauthLoading)}
                className="flex w-full items-center justify-between rounded-md border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-foreground/80 transition hover:bg-sand-50 disabled:opacity-60"
              >
                <span>{provider.label}</span>
                <span className="text-xs text-foreground/50">
                  {oauthLoading === provider.id
                    ? "Redirecting..."
                    : provider.helper || ""}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-foreground/50">
            Tip: Yahoo users can create an account with email + password; Outlook/Hotmail users can use the Microsoft button.
          </p>
        </>
      )}

      {showSwitchLink && (
        <p className="mt-4 text-sm text-foreground/80">
          <Link href={switchLink.href} className="text-emerald-700 underline">
            {switchLink.text}
          </Link>
        </p>
      )}
    </section>
  );
}

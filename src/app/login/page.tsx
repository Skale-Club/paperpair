"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const role = (data.user.app_metadata as { role?: string })?.role;
        router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
      }
    });
  }, [router, supabase]);

  const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleOAuthLogin = async () => {
    setError(null);
    setLoadingProvider(true);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoadingProvider(false);
    }
  };

  return (
    <div className="mx-auto mt-16 flex max-w-4xl justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-sand-200 bg-white px-8 py-10 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-emerald-700">PaperPair</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Enter your email and password to access your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handlePasswordSignIn}>
          <div className="space-y-2">
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
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-foreground shadow-inner focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                minLength={6}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 pr-10 text-sm text-foreground shadow-inner focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-foreground/60 hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-foreground/70">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-sand-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Keep me signed in on this device</span>
            </label>
            <Link href="/contact" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Working..." : "Log in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-foreground/50">
          <span className="h-px flex-1 bg-sand-200" />
          <span>Or login with</span>
          <span className="h-px flex-1 bg-sand-200" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleOAuthLogin}
            disabled={loadingProvider}
            className="flex items-center justify-center gap-3 rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-foreground/80 transition hover:bg-sand-50 disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-inner">
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </span>
            <span>Sign in with Google</span>
            <span className="text-xs text-foreground/50">
              {loadingProvider ? "Redirecting..." : ""}
            </span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-foreground/80">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Register now
          </Link>
        </p>
      </section>
    </div>
  );
}

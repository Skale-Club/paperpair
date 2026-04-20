"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type DashboardGeneralMenuProps = {
  open: boolean;
  onClose: () => void;
};

type MenuItem = {
  href?: string;
  label: string;
  kind?: "button";
  onClick?: () => void;
};

export function DashboardGeneralMenu({ open, onClose }: DashboardGeneralMenuProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profileFullName, setProfileFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileFullName(null);
      setAvatarUrl(null);
      return;
    }

    const controller = new AbortController();
    fetch("/api/profile", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Profile fetch failed");
        return response.json();
      })
      .then((payload) => {
        if (payload?.fullName && typeof payload.fullName === "string" && payload.fullName.trim().length > 0) {
          setProfileFullName(payload.fullName.trim());
        } else {
          setProfileFullName(null);
        }

        if (payload?.avatarUrl && typeof payload.avatarUrl === "string") {
          setAvatarUrl(payload.avatarUrl);
        } else {
          setAvatarUrl(null);
        }
      })
      .catch(() => {
        setProfileFullName(null);
      });

    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const isAdmin = user?.app_metadata?.role === "admin";
  const fallbackName = user?.email?.split("@")[0] ?? null;
  const userName = user ? profileFullName ?? fallbackName ?? "Welcome back" : "Welcome back";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/login");
    router.refresh();
  };

  const signedInMenuItems: MenuItem[] = user
    ? isAdmin
      ? [
          { href: "/dashboard/profile", label: "Profile Settings" },
          { href: "/contact", label: "Contact us" },
          { label: "Log out", kind: "button", onClick: () => void handleLogout() }
        ]
      : [
          { href: "/dashboard/profile", label: "Profile Settings" },
          { href: "/contact", label: "Contact us" },
          { label: "Log out", kind: "button", onClick: () => void handleLogout() }
        ]
    : [
        { href: "/home", label: "Home" },
        { href: "/blogs", label: "Blogs" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" }
      ];

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${open ? "pointer-events-auto bg-slate-950/30" : "pointer-events-none bg-transparent"}`}
        aria-hidden={!open}
      >
        <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close user menu" />

        <aside
          className={`absolute right-0 top-0 flex h-screen w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-label="User menu"
        >
          <div className="px-6 py-6 text-white" style={{ background: "#2c3826" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-slate-900" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="h-full w-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  )}

                </div>
                <p className="mt-4 text-xl font-semibold">{userName}</p>
                {user?.email && (
                  <p className="mt-0.5 truncate text-sm" style={{ color: "var(--color-trust-muted)" }}>
                    {user.email}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-300 transition-colors hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 py-2">
            {signedInMenuItems.map((item) =>
              item.kind === "button" ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onClose();
                    item.onClick?.();
                  }}
                  className="block w-full px-6 py-4 text-left text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="block px-6 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/home", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" }
];

type MenuItem = {
  href?: string;
  label: string;
  kind?: "button";
  onClick?: () => void;
};

function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

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
    if (!userMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    setUserMenuOpen(false);
    setOpen(false);
  }, [pathname]);

  const isAdmin = user?.app_metadata?.role === "admin";
  const userName =
    typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : user?.email?.split("@")[0] ?? "PaperPair member";
  const userEmail = user?.email ?? "Sign in to access your dashboard";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const signedInMenuItems: MenuItem[] = user
    ? isAdmin
      ? [
          { label: "Log out", kind: "button", onClick: () => void handleLogout() },
          { href: "/admin/dashboard", label: "Control Center" },
          { href: "/admin/preferences", label: "Preferences" },
          { href: "/contact", label: "Contact us" }
        ]
      : [
          { label: "Log out", kind: "button", onClick: () => void handleLogout() },
          { href: "/dashboard", label: "My Dashboard" },
          { href: "/dashboard/control-center", label: "Control Center" },
          { href: "/contact", label: "Contact us" }
        ]
    : [
        { href: "/login", label: "Sign in" },
        { href: "/contact", label: "Contact us" }
      ];

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/home" className="font-semibold text-slate-900">
          PaperPair
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {links.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 pb-1 text-sm transition-colors ${
                  active
                    ? "border-primary font-semibold text-slate-900"
                    : "border-transparent text-slate-600 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="ml-2 border-l border-slate-200 pl-4">
            {userMenuOpen ? (
              <div className="h-9 w-9" aria-hidden="true" />
            ) : (
              <button
                type="button"
                onClick={() => setUserMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200"
                aria-label="Open user menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <button
          className="rounded border border-slate-300 px-2 py-1 text-sm md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open menu"
        >
          Menu
        </button>
      </nav>

      {open ? (
        <ul className="space-y-2 border-t border-slate-200 px-4 py-3 md:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="block text-sm text-slate-700" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li className="border-t border-slate-200 pt-2">
            <div className="space-y-2">
              {signedInMenuItems.map((item) =>
                item.kind === "button" ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="block text-sm font-semibold text-primary"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </li>
        </ul>
      ) : null}

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          userMenuOpen ? "pointer-events-auto bg-slate-950/30" : "pointer-events-none bg-transparent"
        }`}
        aria-hidden={!userMenuOpen}
      >
        <button
          type="button"
          className="absolute inset-0 cursor-default"
          onClick={() => setUserMenuOpen(false)}
          aria-label="Close user menu"
        />

        <aside
          className={`absolute right-0 top-0 flex h-screen w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
            userMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="User menu"
        >
          <div className="bg-slate-950 px-6 py-6 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                  <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </div>
                <p className="mt-4 text-xl font-semibold">{userName}</p>
                <p className="mt-1 truncate text-sm text-slate-400">{userEmail}</p>
              </div>

              <button
                type="button"
                onClick={() => setUserMenuOpen(false)}
                className="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
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
                    setUserMenuOpen(false);
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
                  onClick={() => setUserMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}

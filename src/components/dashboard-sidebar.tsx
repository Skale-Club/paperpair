"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

const MENU_ITEMS = [
  {
    href: "/dashboard",
    labelKey: "sidebar.dashboard" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )
  },
  {
    href: "/dashboard/personal-info",
    labelKey: "sidebar.myCase" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  },
  {
    href: "/dashboard/evidence",
    labelKey: "sidebar.evidence" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    href: "/dashboard/documents/gather",
    labelKey: "sidebar.documentsToGather" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  },
  {
    href: "/dashboard/interview",
    labelKey: "sidebar.interviewPrep" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a1.994 1.994 0 0 1-1.414-.586m0 0L11 14h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4l.586-.586z" />
      </svg>
    )
  },
  {
    href: "/dashboard/forms/i485",
    labelKey: "sidebar.forms" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )
  },

  {
    href: "/dashboard/support",
    labelKey: "sidebar.support" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  {
    href: "/dashboard/settings",
    labelKey: "sidebar.settings" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  }
];

type DashboardSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: { avatarUrl?: string | null }) => {
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      })
      .catch(() => {/* ignore */ });
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const data = await res.json() as { success?: boolean; avatarUrl?: string; error?: string };
      if (data.success && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
      }
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const isAdmin = user?.app_metadata?.role === "admin";
  const userFullName = user?.user_metadata?.full_name || "Guest User";
  const userEmail = user?.email || "";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? "pointer-events-auto bg-slate-950/30 opacity-100" : "pointer-events-none opacity-0"
          }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="h-full w-full cursor-default"
          onClick={onClose}
          aria-label="Close dashboard menu"
        />
      </div>

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-[320px] flex-col bg-[#0F172A] text-white shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard menu"
      >
        {open ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute -left-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-md transition-colors hover:bg-slate-700 hover:text-white"
            aria-label="Collapse menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : null}

        <div className="hide-scrollbar flex h-full flex-col overflow-y-auto py-6">
          <div className="mb-8 flex flex-col items-center px-4">
            <div className="relative mb-3" title="Click to change profile picture">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void handleFileChange(e)}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                className="group flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-slate-500 hover:ring-2 hover:ring-slate-500/30"
                aria-label="Change profile picture"
                disabled={uploading}
              >
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                ) : avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-2 h-[85%] w-[85%] opacity-80 transition-opacity group-hover:opacity-100">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0F172A] bg-green-500 shadow-sm transition-colors hover:bg-green-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-[80%] w-[80%] text-[#0F172A]">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="w-full overflow-hidden text-center">
              <h3 className="truncate text-base font-semibold text-white">{userFullName}</h3>
              <p className="truncate text-xs text-slate-400">{userEmail}</p>
            </div>
          </div>

          <nav className="flex-1 px-3">
            <ul className="flex flex-col gap-1.5">
              {MENU_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${active
                        ? "bg-white text-[#0F172A] shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      onClick={onClose}
                    >
                      <span className={active ? "text-[#0F172A]" : "text-slate-400 group-hover:text-slate-300"}>
                        {item.icon}
                      </span>
                      <span className="truncate">{t(item.labelKey, lang)}</span>
                    </Link>
                  </li>
                );
              })}

              {isAdmin ? (
                <>
                  <li className="mx-2 my-3 border-t border-slate-700/50" />
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-400 transition-all duration-200 hover:bg-amber-400/10 hover:text-amber-300"
                      onClick={onClose}
                    >
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </span>
                      <span className="truncate">{t("sidebar.adminPanel", lang)}</span>
                    </Link>
                  </li>
                </>
              ) : null}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

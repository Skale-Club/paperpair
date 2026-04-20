"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
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
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    href: "/admin/documents",
    label: "Paperwork",
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
    href: "/admin/audit-logs",
    label: "Audit Logs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  },
  {
    href: "/admin/cms",
    label: "Landing Pages",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  },
  {
    href: "/admin/blogs",
    label: "Blogs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
      </svg>
    )
  },
  {
    href: "/admin/ai-keys",
    label: "Settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adminSidebarExpanded");
    if (stored === "true") setIsExpanded(true);
  }, []);

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem("adminSidebarExpanded", String(next));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`relative z-50 hidden shrink-0 flex-col transition-all duration-300 ease-in-out md:flex border-r border-white/5 ${
        isExpanded ? "w-60" : "w-[68px]"
      }`}
      style={{ background: "#2c3826" }}
    >
      <div
        className="flex h-14 shrink-0 items-center justify-between px-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span
          className={`whitespace-nowrap text-base font-bold tracking-tight transition-all duration-200 ${
            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 overflow-hidden"
          }`}
          style={{ color: "#fff" }}
        >
          Admin Suite
        </span>

        <button
          type="button"
          onClick={toggle}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isExpanded ? "" : "mx-auto"
          }`}
          style={{ color: "var(--color-trust-muted)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "var(--color-trust-muted)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isExpanded ? (
              <>
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </>
            ) : (
              <>
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex h-10 items-center transition-all duration-150 rounded-lg ${
                isExpanded ? "w-full gap-3 px-2.5" : "mx-auto w-10 justify-center"
              }`}
              style={
                active
                  ? { background: "var(--color-trust)", color: "#fff" }
                  : { color: "var(--color-trust-muted)" }
              }
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-trust-muted)";
                }
              }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {item.icon}
              </span>
              <span
                className={`whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                  isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 overflow-hidden"
                }`}
              >
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-[calc(100%+12px)] z-[100] scale-90 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
                  <div className="relative rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xl whitespace-nowrap">
                    {/* arrow */}
                    <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900" />
                    {item.label}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <LogoutButton
          className={`group relative flex h-10 items-center transition-all duration-150 rounded-lg ${
            isExpanded ? "w-full gap-3 px-2.5" : "mx-auto w-10 justify-center"
          }`}
          style={{ color: "var(--color-trust-muted)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.1)";
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "var(--color-trust-muted)";
          }}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          {isExpanded && <span className="text-sm font-medium">Logout</span>}
          
          {/* Tooltip for collapsed state */}
          {!isExpanded && (
            <div className="absolute left-[calc(100%+12px)] z-[100] scale-90 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
              <div className="relative rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xl whitespace-nowrap">
                <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-red-600" />
                Logout
              </div>
            </div>
          )}
        </LogoutButton>
      </div>
    </aside>
  );
}

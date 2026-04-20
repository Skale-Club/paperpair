"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

const MENU_ITEMS = [
  {
    href: "/dashboard",
    labelKey: "sidebar.dashboard" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    href: "/dashboard/personal-info",
    labelKey: "sidebar.myCase" as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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
    href: "/dashboard/my-forms",
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

export function DashboardQuickRail() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop: collapsible left rail */}
      <aside
        className={`relative z-50 hidden h-full shrink-0 flex-col transition-all duration-300 ease-in-out md:flex ${
          isExpanded ? "w-60" : "w-[68px]"
        }`}
        style={{ background: "#2c3826" }}
      >
        <div
          className="flex h-14 shrink-0 items-center justify-between px-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* PaperPair brand — visible when expanded */}
          <span
            className={`whitespace-nowrap text-base font-bold tracking-tight transition-all duration-200 ${
              isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 overflow-hidden"
            }`}
            style={{ color: "#fff" }}
          >
            PaperPair
          </span>

          {/* Collapse / expand button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isExpanded ? "" : "mx-auto"
            }`}
            style={{ color: "var(--color-trust-muted)" }}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "";
              (e.currentTarget as HTMLElement).style.color = "var(--color-trust-muted)";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isExpanded ? (
                /* chevrons-left — clear "collapse" signal */
                <>
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </>
              ) : (
                /* chevrons-right — clear "expand" signal */
                <>
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
          {MENU_ITEMS.map((item) => {
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
                  {t(item.labelKey, lang)}
                </span>

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-[calc(100%+12px)] z-[100] scale-90 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
                    <div className="relative rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xl whitespace-nowrap">
                      {/* arrow */}
                      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900" />
                      {t(item.labelKey, lang)}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* Mobile: bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white md:hidden">
        <ul className="flex items-stretch">
          {MENU_ITEMS.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2 transition-colors ${
                    active ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      active ? "bg-slate-900 text-white" : ""
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-medium leading-tight">
                    {t(item.labelKey, lang)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

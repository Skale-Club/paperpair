"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Control Center",
    description: "Platform health"
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "All couples & progress"
  },
  {
    href: "/admin/documents",
    label: "Default Templates",
    description: "USCIS PDFs & checklists"
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    description: "Security & changes"
  },
  {
    href: "/admin/cms",
    label: "Pages (CMS)",
    description: "Home, Contact, Blogs"
  },
  {
    href: "/admin/blogs",
    label: "Blogs",
    description: "Publish public articles"
  },
  {
    href: "/admin/ai-keys",
    label: "AI Keys",
    description: "Google, OpenAI, OpenRouter"
  },
  {
    href: "/admin/preferences",
    label: "Preferences",
    description: "Lighting, sounds, layout"
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adminSidebarCollapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("adminSidebarCollapsed", String(next));
  };

  return (
    <aside
      className="shrink-0 transition-all duration-300 ease-in-out relative z-10"
      style={{ width: collapsed ? "80px" : "280px" }}
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-900/95 p-4 text-white md:sticky md:top-6 shadow-xl backdrop-blur-md flex flex-col min-h-[500px]">
        {/* Toggle Button */}
        <button
          onClick={toggle}
          className="absolute -right-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-md z-20"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>

        <div className={`mb-5 border-b border-slate-700/50 pb-4 transition-all ${collapsed ? "text-center" : ""}`}>
          {!collapsed ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Admin</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden">Skale Control</h2>
            </>
          ) : (
            <div className="flex justify-center flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-inner">
                SC
              </span>
            </div>
          )}
        </div>

        <nav aria-label="Admin navigation" className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${isActive
                      ? "border-indigo-500/30 bg-indigo-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                      : "border-transparent bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      } ${collapsed ? "justify-center" : ""}`}
                  >
                    {/* Placeholder Icon based on first letter since we don't have SVGs mapped */}
                    <div className={`flex items-center justify-center rounded-lg transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                      <span className="font-bold text-lg leading-none w-6 text-center">{item.label.charAt(0)}</span>
                    </div>

                    {!collapsed && (
                      <div className="overflow-hidden">
                        <p className={`text-sm font-semibold truncate transition-colors ${isActive ? "text-indigo-100" : ""}`}>{item.label}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-slate-700/50 pt-4">
          <LogoutButton
            className={`justify-center w-full transition-all duration-200 ${pathname === "/login" /* fallback */ ? "bg-red-500/20 text-red-200 hover:bg-red-500/30" : "bg-white/5 text-slate-300 hover:bg-white/10"
              } rounded-xl py-2.5 text-sm font-semibold flex items-center gap-2`}
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            ) : (
              "Sair"
            )}
          </LogoutButton>
        </div>
      </div>
    </aside>
  );
}

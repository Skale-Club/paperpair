"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CaseHealthTopbar } from "@/components/case-health-topbar";
import { PasskeyPrompt } from "@/components/passkey-prompt";
import { DashboardGeneralMenu } from "@/components/dashboard-general-menu";
import { DashboardQuickRail } from "@/components/dashboard-quick-rail";

type DashboardShellProps = {
  children: ReactNode;
  completedSteps: number;
  totalSteps: number;
  previewMode?: boolean;
};

export function DashboardShell({
  children,
  completedSteps,
  totalSteps,
  previewMode = false
}: DashboardShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <DashboardQuickRail />

      <div className="flex flex-1 flex-col overflow-auto">
        <CaseHealthTopbar
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen((value) => !value)}
        />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {previewMode ? (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-200/50 bg-amber-50/50 p-4 text-sm text-amber-700 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-amber-900">Preview Mode</p>
                  <p className="opacity-90">Live case data is currently paused. Showing UI preview.</p>
                </div>
              </div>
            </div>
          ) : null}
          {!previewMode ? <PasskeyPrompt /> : null}
          {children}
        </main>
      </div>

      <DashboardGeneralMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}

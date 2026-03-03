"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

type Props = {
  completedSteps: number;
  totalSteps: number;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
};

export function CaseHealthTopbar({
  completedSteps,
  totalSteps,
  isMenuOpen,
  onMenuToggle
}: Props) {
  const { lang } = useLanguage();
  const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const progressColor =
    percent >= 75
      ? "#22C55E"
      : percent >= 40
        ? "#F59E0B"
        : "#EF4444";

  return (
    <header
      className="sticky top-0 z-40 flex flex-wrap items-center gap-4 px-5 py-3 shadow-sm"
      style={{ background: "var(--color-trust)", color: "#fff" }}
    >
      <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-bold tracking-tight text-white">PaperPair</span>
      </Link>

      <div className="min-w-[220px] flex-1 max-w-xl">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-white/75">{t("topbar.caseHealth", lang)}</span>
          <span className="text-xs font-bold text-white">{percent}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%`, background: progressColor }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onMenuToggle}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
          isMenuOpen
            ? "border-white/30 bg-white/10 text-white"
            : "border-white/20 bg-white/5 text-white hover:bg-white/10"
        }`}
        aria-label={isMenuOpen ? "Menu open" : "Open menu"}
        aria-expanded={isMenuOpen}
        aria-haspopup="dialog"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { lang } = useLanguage();
  const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const showProgress = true;

  const progressColor =
    percent >= 75
      ? "#22C55E"
      : percent >= 40
        ? "#F59E0B"
        : "#EF4444";

  return (
    <header
      className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 px-6 shadow-sm"
      style={{ background: "var(--color-trust)", color: "#fff" }}
    >
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
        <span className="text-base font-bold tracking-tight text-white"></span>
      </Link>
      {showProgress && (
        <div className="hidden min-w-[160px] max-w-xs sm:block">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{t("topbar.caseHealth", lang)}</span>
            <span className="text-[10px] font-bold text-white/90">{percent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(255,255,255,0.1)]"
              style={{ width: `${percent}%`, background: progressColor }}
            />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${isMenuOpen
            ? "bg-white/20 text-white scale-90"
            : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          aria-label={isMenuOpen ? "Menu open" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-haspopup="dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

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
  const showProgress = pathname !== "/dashboard";

  const progressColor =
    percent >= 75
      ? "#22C55E"
      : percent >= 40
        ? "#F59E0B"
        : "#EF4444";

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-5 py-3 shadow-sm"
      style={{ background: "var(--color-trust)", color: "#fff" }}
    >
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
        <span className="text-lg font-bold tracking-tight text-white">PaperPair</span>
      </Link>

      {showProgress && (
        <div className="hidden min-w-[160px] max-w-xs sm:block">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-white/75">{t("topbar.caseHealth", lang)}</span>
            <span className="text-[11px] font-bold text-white">{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percent}%`, background: progressColor }}
            />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <nav className="hidden items-center gap-3 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${active
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onMenuToggle}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${isMenuOpen
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
      </div>
    </header>
  );
}

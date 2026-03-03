"use client";

import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "pt-BR" : "en")}
      className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
      aria-label="Toggle language"
    >
      {t("lang.switch", lang)}
    </button>
  );
}

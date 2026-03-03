"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Lang } from "@/lib/translations";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("lang="));
    const stored = cookie?.split("=")[1]?.trim();
    if (stored === "pt-BR") setLangState("pt-BR");
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    document.cookie = `lang=${newLang};path=/;max-age=31536000;samesite=lax`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

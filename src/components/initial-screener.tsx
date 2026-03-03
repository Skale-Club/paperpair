"use client";

import { useEffect, useState } from "react";

export function InitialScreener() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("screener_done");
    if (!seen) setOpen(true);
  }, []);

  const select = (type: "overstay" | "ewi") => {
    localStorage.setItem("case_type", type);
    localStorage.setItem("screener_done", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-5" style={{ background: "var(--color-trust)" }}>
          <h2 className="text-xl font-bold text-white">Let&apos;s set up your case</h2>
          <p className="mt-1 text-sm text-white/75">
            How did you enter the United States?
          </p>
        </div>

        <div className="grid gap-3 p-6 sm:grid-cols-2">
          <button
            onClick={() => select("overstay")}
            className="group flex flex-col gap-2 rounded-xl border-2 border-slate-200 p-5 text-left transition hover:border-[#1A365D] hover:bg-[#EBF0F8]"
          >
            <span className="text-2xl">✈️</span>
            <span className="text-sm font-bold text-slate-900">Visa Overstay</span>
            <span className="text-xs text-slate-500 leading-relaxed">
              I entered legally with a visa and stayed past my authorized period.
            </span>
          </button>

          <button
            onClick={() => select("ewi")}
            className="group flex flex-col gap-2 rounded-xl border-2 border-slate-200 p-5 text-left transition hover:border-[#1A365D] hover:bg-[#EBF0F8]"
          >
            <span className="text-2xl">🚶</span>
            <span className="text-sm font-bold text-slate-900">Entry Without Inspection (EWI)</span>
            <span className="text-xs text-slate-500 leading-relaxed">
              I entered without being inspected by a border officer.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

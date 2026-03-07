"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EntryType = "overstay" | "ewi";

export function InitialScreener() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("screener_done");
    if (!seen) setOpen(true);
  }, []);

const persistSelection = async (entryType: EntryType) => {
  const response = await fetch("/api/dashboard/steps", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stepSlug: "immigration-info",
      status: "IN_PROGRESS",
      data: { entryType }
    })
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.status === 401) {
      throw new Error("Please sign in again to save your selection.");
    }
    throw new Error(body?.error ?? "Failed to record your selection.");
  }
};

  const select = async (type: EntryType) => {
    if (saving) return;

    setSaving(true);
    setErrorMessage(null);
    setOpen(false);

    try {
      await persistSelection(type);
      localStorage.setItem("case_type", type);
      localStorage.setItem("screener_done", "true");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save your selection.";
      setErrorMessage(message);
      setOpen(true);
    } finally {
      setSaving(false);
    }
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
            disabled={saving}
            className="group flex flex-col gap-2 rounded-xl border-2 border-slate-200 p-5 text-left transition hover:border-[#1A365D] hover:bg-[#EBF0F8] disabled:cursor-not-allowed disabled:border-slate-200/70"
          >
            <span className="text-2xl">✈️</span>
            <span className="text-sm font-bold text-slate-900">Visa Overstay</span>
            <span className="text-xs text-slate-500 leading-relaxed">
              I entered legally with a visa and stayed past my authorized period.
            </span>
          </button>

          <button
            onClick={() => select("ewi")}
            disabled={saving}
            className="group flex flex-col gap-2 rounded-xl border-2 border-slate-200 p-5 text-left transition hover:border-[#1A365D] hover:bg-[#EBF0F8] disabled:cursor-not-allowed disabled:border-slate-200/70"
          >
            <span className="text-2xl">🚶</span>
            <span className="text-sm font-bold text-slate-900">Entry Without Inspection (EWI)</span>
            <span className="text-xs text-slate-500 leading-relaxed">
              I entered without being inspected by a border officer.
            </span>
          </button>
        </div>

        <div className="px-6 pb-6 pt-3">
          {saving && <p className="text-sm text-slate-500">Recording your entry type…</p>}
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

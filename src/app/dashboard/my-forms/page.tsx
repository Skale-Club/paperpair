"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FORM_PACKS,
  getSentForms,
  getVisitedPacks,
  getPendingForms,
  type FormItem,
  type FormPack,
} from "@/lib/form-packs";
import { PdfViewer } from "@/components/pdf-viewer";
import { PdfPreview } from "@/components/pdf-preview";

type SelectedFormWithPack = { form: FormItem; pack: FormPack };

// ── Pack browse card ──────────────────────────────────────────────
function PackCard({
  pack,
  isVisited,
  hasPending,
  onClick,
}: {
  pack: FormPack;
  isVisited: boolean;
  hasPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-md border border-black bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
    >
      <PdfPreview url={pack.coverPdfUrl} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-md bg-white/80 px-3 py-2 backdrop-blur-sm shadow-sm">
          <p className="text-center text-sm font-semibold text-red-500 leading-snug">{pack.label}</p>
        </div>
      </div>
      {(isVisited || hasPending) && (
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function MyFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<SelectedFormWithPack[]>([]);
  const [visitedPacks, setVisitedPacks] = useState<string[]>([]);
  const [pendingForms, setPendingForms] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  // null = browse view; string = selected form id
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  useEffect(() => {
    const sentIds = getSentForms();
    const result: SelectedFormWithPack[] = [];
    for (const pack of FORM_PACKS) {
      for (const form of pack.forms) {
        if (sentIds.includes(form.id)) result.push({ form, pack });
      }
    }
    setForms(result);
    setVisitedPacks(getVisitedPacks());
    setPendingForms(getPendingForms());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const getPackPendingCount = (packId: string) => {
    const pack = FORM_PACKS.find(p => p.id === packId);
    if (!pack) return 0;
    const ids = new Set(pack.forms.map(f => f.id));
    return pendingForms.filter(id => ids.has(id)).length;
  };

  const activeForm = forms.find(f => f.form.id === activeFormId);

  // Group selected forms by pack (preserve FORM_PACKS order)
  const groupedByPack = FORM_PACKS.map(pack => ({
    pack,
    forms: forms.filter(f => f.pack.id === pack.id).map(f => f.form),
  })).filter(g => g.forms.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      {/* ── Left nav ───────────────────────────────────────────── */}
      <aside className="rounded-2xl border border-slate-200 bg-white px-3 py-5">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          My Case
        </p>
        <p className="mb-4 px-2 text-base font-bold text-slate-900">My Forms</p>

        {groupedByPack.length === 0 ? (
          <p className="px-2 text-xs text-slate-400">No forms selected yet.</p>
        ) : (
          <div className="space-y-4">
            {groupedByPack.map(({ pack, forms: packForms }) => (
              <div key={pack.id}>
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-red-500">
                  {pack.detailLabel}
                </p>
                <div className="space-y-0.5">
                  {packForms.map(form => {
                    const active = activeFormId === form.id;
                    return (
                      <button
                        key={form.id}
                        onClick={() => setActiveFormId(form.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                          active
                            ? "bg-slate-900 font-semibold text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {form.title.replace(/\n/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider + Browse */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => setActiveFormId(null)}
            className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
              activeFormId === null
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            + Browse Form Packages
          </button>
        </div>
      </aside>

      {/* ── Right content ──────────────────────────────────────── */}
      <div className="min-w-0">
        {activeFormId === null ? (
          /* Browse packs */
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-1 text-lg font-bold text-slate-900">Browse Form Packages</h2>
            <p className="mb-6 text-sm text-slate-500">
              Select a package to review and add forms to your case.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {FORM_PACKS.map(pack => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  isVisited={visitedPacks.includes(pack.id)}
                  hasPending={getPackPendingCount(pack.id) > 0}
                  onClick={() => router.push(`/dashboard/forms/pack/${pack.id}`)}
                />
              ))}
            </div>
          </div>
        ) : activeForm ? (
          /* Form PDF view */
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-3">
              <p className="text-xs text-slate-400">{activeForm.pack.label}</p>
              <h2 className="text-base font-semibold text-slate-900">
                {activeForm.form.title.replace(/\n/g, " ")}
              </h2>
            </div>
            <div className="bg-slate-200">
              <PdfViewer url={activeForm.form.pdfUrl} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

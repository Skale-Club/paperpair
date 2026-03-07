"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FORM_PACKS, getSentForms, type FormItem, type FormPack } from "@/lib/form-packs";
import { PdfModal } from "@/components/pdf-modal";

type SelectedFormWithPack = {
  form: FormItem;
  pack: FormPack;
};

export default function MyFormsPage() {
  const [forms, setForms] = useState<SelectedFormWithPack[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openForm, setOpenForm] = useState<FormItem | null>(null);

  useEffect(() => {
    const sentIds = getSentForms();
    const result: SelectedFormWithPack[] = [];
    for (const pack of FORM_PACKS) {
      for (const form of pack.forms) {
        if (sentIds.includes(form.id)) {
          result.push({ form, pack });
        }
      }
    }
    setForms(result);
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <>
      {openForm && (
        <PdfModal
          url={openForm.pdfUrl}
          title={openForm.title.replace(/\n/g, " ")}
          onClose={() => setOpenForm(null)}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            My Case
          </p>
          <h1 className="text-2xl font-bold text-slate-900">My Forms</h1>
          <p className="mt-1 text-sm text-slate-500">Forms you&apos;ve selected for your case.</p>
        </div>

        {forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-700">No forms yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Browse form packages and add the ones you need.
            </p>
            <Link
              href="/dashboard/forms"
              className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
            >
              Browse Forms
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {FORM_PACKS.map(pack => {
              const packForms = forms.filter(f => f.pack.id === pack.id);
              if (packForms.length === 0) return null;
              return (
                <div key={pack.id}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-500">
                    {pack.detailLabel}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {packForms.map(({ form }) => (
                      <button
                        key={form.id}
                        onClick={() => setOpenForm(form)}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-line text-sm font-medium leading-snug text-slate-900">
                            {form.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">{pack.label}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                          Open
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="border-t border-slate-100 pt-4">
              <Link
                href="/dashboard/forms"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add more forms
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

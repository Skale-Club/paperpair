"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FORM_PACKS,
  getPackPendingForms,
  confirmPackSelection,
  sendForms,
  type FormItem,
} from "@/lib/form-packs";
import { PdfPreview } from "@/components/pdf-preview";

function FormDocCard({
  form,
  isSelected,
  onToggle,
}: {
  form: FormItem;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative aspect-[3/4] w-full overflow-hidden rounded-md border bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
        isSelected ? "border-slate-900 ring-2 ring-slate-900" : "border-black"
      }`}
    >
      {/* Blurred real PDF page */}
      <PdfPreview url={form.pdfUrl} />

      {/* Title — centered above the selection circle */}
      <div className="absolute inset-x-0 top-0 bottom-10 flex items-center justify-center px-3">
        <p className="whitespace-pre-line text-center text-xs font-semibold text-red-500 leading-snug drop-shadow-sm">
          {form.title}
        </p>
      </div>

      {/* Selection circle — bottom-right */}
      <div className="absolute bottom-2 right-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            isSelected
              ? "border-slate-900 bg-slate-900"
              : "border-slate-400 bg-white/80 group-hover:border-slate-600"
          }`}
        >
          {isSelected && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function EditionWarningBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
      style={{
        background: "var(--color-warning-bg)",
        borderColor: "var(--color-warning-border)",
        color: "var(--color-warning-text)",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <p>This edition may be outdated. Always download the current form directly from USCIS.gov before filing.</p>
    </div>
  );
}

export default function PackDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const pack = FORM_PACKS.find(p => p.id === id);

  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (pack) {
      setSelectedForms(getPackPendingForms(pack.id));
    }
  }, [pack]);

  if (!pack) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-slate-500">Form pack not found.</p>
      </div>
    );
  }

  const toggleForm = (formId: string) => {
    setSelectedForms(prev =>
      prev.includes(formId) ? prev.filter(f => f !== formId) : [...prev, formId]
    );
  };

  const handleNext = () => {
    if (selectedForms.length > 0) setShowModal(true);
  };

  const handleSelectMoreForms = () => {
    confirmPackSelection(pack.id, selectedForms);
    setShowModal(false);
    router.push("/dashboard/my-forms");
  };

  const handleSendNow = () => {
    confirmPackSelection(pack.id, selectedForms);
    sendForms();
    setShowModal(false);
    router.push("/dashboard/my-forms");
  };

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push("/dashboard/my-forms")}
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          My Forms
        </button>
        <h1 className="text-xl font-semibold text-red-500">{pack.detailLabel}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select the forms you need from this package.
        </p>
      </div>

      {/* Instructions section — per D-05, FORM-02 */}
      <div className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm leading-relaxed text-slate-700">{pack.instructions.purpose}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Who fills this: <span className="normal-case font-normal text-slate-700">{pack.instructions.whoFills}</span>
        </p>
        <p className="text-sm leading-relaxed text-slate-600">{pack.instructions.whatToExpect}</p>
      </div>

      {/* Edition warning banner — per D-06, FORM-03 */}
      {new Date() > pack.lockedUntil && (
        <div className="mb-6">
          <EditionWarningBanner />
        </div>
      )}

      {/* Form cards grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {pack.forms.map(form => (
          <FormDocCard
            key={form.id}
            form={form}
            isSelected={selectedForms.includes(form.id)}
            onToggle={() => toggleForm(form.id)}
          />
        ))}
      </div>

      {/* USCIS download link — per D-07, FORM-04 */}
      <div className="mt-6">
        <a
          href={pack.uscisUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Download from USCIS.gov
        </a>
      </div>

      {/* Next button */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedForms.length === 0}
          className="rounded-md border border-black bg-white px-6 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* Send / Select-More modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedForms.length} form{selectedForms.length !== 1 ? "s" : ""} selected
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              From:{" "}
              <span className="font-medium text-slate-700">{pack.detailLabel}</span>
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSendNow}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
              >
                Send Now
              </button>
              <button
                type="button"
                onClick={handleSelectMoreForms}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Select More Forms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

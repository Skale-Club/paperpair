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

export default function PackDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const pack = FORM_PACKS.find(p => p.id === id);

  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [existingSentIds, setExistingSentIds] = useState<string[]>([]);

  useEffect(() => {
    if (pack) {
      setSelectedForms(getPackPendingForms(pack.id));
    }
  }, [pack]);

  useEffect(() => {
    // Fetch current persisted sent form IDs so sendForms() can merge correctly
    fetch("/api/dashboard/selected-forms")
      .then(res => res.ok ? res.json() as Promise<{ formIds: string[] }> : null)
      .then(data => { if (data?.formIds) setExistingSentIds(data.formIds); })
      .catch(() => { /* use empty default */ });
  }, []);

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
    sendForms(existingSentIds);
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

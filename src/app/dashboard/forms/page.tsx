"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FORM_PACKS, getVisitedPacks, getPendingForms, type FormPack } from "@/lib/form-packs";
import { PdfPreview } from "@/components/pdf-preview";

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
  const showBadge = isVisited || hasPending;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-md border border-black bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
    >
      {/* Blurred real PDF page */}
      <PdfPreview url={pack.coverPdfUrl} />

      {/* Label overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-md bg-white/80 px-3 py-2 backdrop-blur-sm shadow-sm">
          <p className="text-center text-sm font-semibold text-red-500 leading-snug">
            {pack.label}
          </p>
        </div>
      </div>

      {/* Visited / has-pending checkmark badge */}
      {showBadge && (
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm">
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
        </div>
      )}
    </button>
  );
}

export default function FormsPage() {
  const router = useRouter();
  const [visitedPacks, setVisitedPacks] = useState<string[]>([]);
  const [pendingForms, setPendingForms] = useState<string[]>([]);

  useEffect(() => {
    setVisitedPacks(getVisitedPacks());
    setPendingForms(getPendingForms());
  }, []);

  const getPackPendingCount = (packId: string) => {
    const pack = FORM_PACKS.find(p => p.id === packId);
    if (!pack) return 0;
    const packFormIds = new Set(pack.forms.map(f => f.id));
    return pendingForms.filter(id => packFormIds.has(id)).length;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          My Case
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Forms</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a form package to review and choose the forms you need.
        </p>
      </div>

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
  );
}

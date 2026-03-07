"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileData = {
  fullName?: string;
  email?: string;
  spouseName?: string;
  spouseEmail?: string;
  birthCity?: string;
  birthState?: string;
  birthCountry?: string;
  spouseBirthCity?: string;
  spouseBirthState?: string;
  spouseBirthCountry?: string;
  filingReason?: string;
  entryType?: string;
};

const FILING_REASON_LABELS: Record<string, string> = {
  "married-to-usc": "💍 Married to a U.S. Citizen",
  "child-of-usc": "👶 Child of a U.S. Citizen",
  "parent-of-usc": "👨‍👩‍👧 Parent of a U.S. Citizen (21+)",
  "other": "📋 Other basis",
};
const ENTRY_TYPE_LABELS: Record<string, string> = {
  "overstay": "✈️ Visa Overstay",
  "ewi": "🚶 Entry Without Inspection (EWI)",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function CaseProfileCard({ data }: { data: ProfileData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileData>(data);

  const set = (key: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/steps", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepSlug: "immigration-info",
          status: "IN_PROGRESS",
          data: draft,
        }),
      });
      if (!res.ok) throw new Error("Failed to save.");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatPlace = (city?: string, state?: string, country?: string) => {
    const parts = [city, state, country].filter(Boolean);
    return parts.length ? parts.join(", ") : undefined;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Case Profile</h2>
          <p className="mt-0.5 text-sm text-slate-500">Information collected during setup</p>
        </div>
        {!editing ? (
          <button
            onClick={() => { setDraft(data); setEditing(true); setError(null); }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {error && <p className="mb-4 text-xs text-red-600">{error}</p>}

      {!editing ? (
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full Name" value={data.fullName} />
          <Field label="Your Email" value={data.email} />
          <Field label="Place of Birth" value={formatPlace(data.birthCity, data.birthState, data.birthCountry)} />
          <Field label="Spouse's Name" value={data.spouseName} />
          <Field label="Spouse's Email" value={data.spouseEmail} />
          <Field label="Spouse's Place of Birth" value={formatPlace(data.spouseBirthCity, data.spouseBirthState, data.spouseBirthCountry)} />
          <Field label="Filing Reason" value={data.filingReason ? FILING_REASON_LABELS[data.filingReason] ?? data.filingReason : undefined} />
          <Field label="Entry Type" value={data.entryType ? ENTRY_TYPE_LABELS[data.entryType] ?? data.entryType : undefined} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Your info */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Your Information</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Full Legal Name</label>
                <input className={inputClass} value={draft.fullName ?? ""} onChange={set("fullName")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
                <input type="email" className={inputClass} value={draft.email ?? ""} onChange={set("email")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">City of Birth</label>
                <input className={inputClass} value={draft.birthCity ?? ""} onChange={set("birthCity")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">State / Province of Birth <span className="text-slate-400">(optional)</span></label>
                <input className={inputClass} value={draft.birthState ?? ""} onChange={set("birthState")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Country of Birth</label>
                <input className={inputClass} value={draft.birthCountry ?? ""} onChange={set("birthCountry")} />
              </div>
            </div>
          </div>

          {/* Spouse info */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Spouse&apos;s Information</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Spouse&apos;s Full Legal Name</label>
                <input className={inputClass} value={draft.spouseName ?? ""} onChange={set("spouseName")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Spouse&apos;s Email</label>
                <input type="email" className={inputClass} value={draft.spouseEmail ?? ""} onChange={set("spouseEmail")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Spouse&apos;s City of Birth</label>
                <input className={inputClass} value={draft.spouseBirthCity ?? ""} onChange={set("spouseBirthCity")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Spouse&apos;s State / Province <span className="text-slate-400">(optional)</span></label>
                <input className={inputClass} value={draft.spouseBirthState ?? ""} onChange={set("spouseBirthState")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Spouse&apos;s Country of Birth</label>
                <input className={inputClass} value={draft.spouseBirthCountry ?? ""} onChange={set("spouseBirthCountry")} />
              </div>
            </div>
          </div>

          {/* Case info */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Case Details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Filing Reason</label>
                <select className={inputClass} value={draft.filingReason ?? ""} onChange={set("filingReason")}>
                  <option value="">— Select —</option>
                  <option value="married-to-usc">💍 Married to a U.S. Citizen</option>
                  <option value="child-of-usc">👶 Child of a U.S. Citizen</option>
                  <option value="parent-of-usc">👨‍👩‍👧 Parent of a U.S. Citizen (21+)</option>
                  <option value="other">📋 Other basis</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Entry Type</label>
                <select className={inputClass} value={draft.entryType ?? ""} onChange={set("entryType")}>
                  <option value="">— Select —</option>
                  <option value="overstay">✈️ Visa Overstay</option>
                  <option value="ewi">🚶 Entry Without Inspection (EWI)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

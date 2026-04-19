"use client";

import { useState } from "react";

const CASE_STATUS_OPTIONS = [
  { value: "", label: "Select status…" },
  { value: "biometrics-pending", label: "Biometrics pending" },
  { value: "interview-scheduled", label: "Interview scheduled" },
  { value: "approved", label: "Approved" },
  { value: "rfe-received", label: "RFE received" },
  { value: "other", label: "Other" },
];

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20";

const labelClass = "block text-sm font-medium text-slate-700";

interface ImmigrationInfoFormProps {
  /** Existing step data from DB — screener answers etc. Merged on save to avoid overwriting. */
  existingData: Record<string, unknown>;
}

export function ImmigrationInfoForm({ existingData }: ImmigrationInfoFormProps) {
  const [receiptNumber, setReceiptNumber] = useState(
    (existingData.receiptNumber as string) ?? ""
  );
  const [i130ReceiptNumber, setI130ReceiptNumber] = useState(
    (existingData.i130ReceiptNumber as string) ?? ""
  );
  const [priorityDate, setPriorityDate] = useState(
    (existingData.priorityDate as string) ?? ""
  );
  const [caseStatus, setCaseStatus] = useState(
    (existingData.caseStatus as string) ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/steps", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepSlug: "immigration-info",
          status: "IN_PROGRESS",
          data: {
            // Merge with existing stepData to avoid overwriting screener answers
            ...existingData,
            receiptNumber,
            i130ReceiptNumber,
            priorityDate,
            caseStatus,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to save.");
      }

      setSaved(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900">Receipt Numbers</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Enter the receipt numbers from your I-797C Notice of Action letters. These are assigned by
          USCIS after they accept your filing.
        </p>
      </div>

      {/* I-485 Receipt Number */}
      <div>
        <label htmlFor="receiptNumber" className={labelClass}>
          I-485 Receipt Number
          <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="receiptNumber"
          type="text"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
          placeholder="e.g. IOE#########"
          className={inputClass}
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-slate-400">
          The I-485 receipt number from your Notice of Action for Adjustment of Status.
        </p>
      </div>

      {/* I-130 Receipt Number */}
      <div>
        <label htmlFor="i130ReceiptNumber" className={labelClass}>
          I-130 Receipt Number
          <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="i130ReceiptNumber"
          type="text"
          value={i130ReceiptNumber}
          onChange={(e) => setI130ReceiptNumber(e.target.value)}
          placeholder="e.g. LIN#########"
          className={inputClass}
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-slate-400">
          The I-130 receipt number from your Notice of Action for the Petition for Alien Relative.
        </p>
      </div>

      <hr className="border-slate-100" />

      <div>
        <h2 className="text-base font-semibold text-slate-900">Priority Date &amp; Status</h2>
      </div>

      {/* Priority Date */}
      <div>
        <label htmlFor="priorityDate" className={labelClass}>
          Priority Date
          <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="priorityDate"
          type="text"
          value={priorityDate}
          onChange={(e) => setPriorityDate(e.target.value)}
          placeholder="MM/DD/YYYY"
          className={inputClass}
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-slate-400">
          The priority date shown on your I-130 receipt notice. Immediate relatives typically have
          no wait based on this date.
        </p>
      </div>

      {/* Case Status */}
      <div>
        <label htmlFor="caseStatus" className={labelClass}>
          Case Status
          <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <select
          id="caseStatus"
          value={caseStatus}
          onChange={(e) => setCaseStatus(e.target.value)}
          className={inputClass}
        >
          {CASE_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback */}
      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
          Saved successfully
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[var(--color-trust)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

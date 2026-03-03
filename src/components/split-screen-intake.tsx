"use client";

import { useState } from "react";

type FormData = Record<string, string>;

const QUESTIONS = [
  { key: "lastName", label: "Last Name", placeholder: "e.g. Doe", required: true },
  { key: "firstName", label: "First Name", placeholder: "e.g. Jane", required: true },
  { key: "middleName", label: "Middle Name", placeholder: "e.g. Marie (or N/A)", required: false },
  { key: "dob", label: "Date of Birth", placeholder: "MM/DD/YYYY", required: true },
  { key: "countryOfBirth", label: "Country of Birth", placeholder: "e.g. Brazil", required: true },
  { key: "alienNumber", label: "A-Number (if any)", placeholder: "A-000000000", required: true },
  { key: "ssn", label: "Social Security No.", placeholder: "XXX-XX-XXXX", required: false },
  { key: "address", label: "Current Address", placeholder: "Street, City, State, ZIP", required: false },
  { key: "phone", label: "Phone Number", placeholder: "(555) 000-0000", required: false },
  { key: "email", label: "Email Address", placeholder: "you@example.com", required: false },
];

const MANDATORY_FIELDS = ["lastName", "firstName", "dob", "countryOfBirth", "alienNumber"] as const;

export function sanitizeField(value: string | undefined, required = false): string {
  if (value && value.trim() !== "") return value.trim();
  if (required) return "";
  return "N/A";
}

export function SplitScreenIntake() {
  const [formData, setFormData] = useState<FormData>({});
  const [currentQ, setCurrentQ] = useState(0);

  const set = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const completedMandatory = MANDATORY_FIELDS.filter(
    (k) => formData[k] && formData[k].trim() !== ""
  ).length;

  const canDownload = completedMandatory === MANDATORY_FIELDS.length;

  const handleDownload = () => {
    const sanitized = {
      ...formData,
      middleName: sanitizeField(formData.middleName),
      ssn: sanitizeField(formData.ssn),
      address: sanitizeField(formData.address),
      phone: sanitizeField(formData.phone),
      email: sanitizeField(formData.email),
      alienNumber: sanitizeField(formData.alienNumber, true),
    };
    alert(`Draft ready:\n${JSON.stringify(sanitized, null, 2)}`);
  };

  return (
    <div className="flex h-full gap-0 overflow-hidden rounded-2xl border border-slate-200">
      {/* Left — Chat intake (40%) */}
      <div className="flex w-2/5 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">I-485 Guided Intake</h2>
          <p className="text-xs text-slate-500 mt-0.5">Answer each question to fill your form in real time.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {QUESTIONS.map((q, idx) => (
            <div
              key={q.key}
              className={`rounded-xl border p-3 transition-colors cursor-pointer ${idx === currentQ
                  ? "border-[#1A365D] bg-[#EBF0F8]"
                  : "border-slate-200 bg-slate-50"
                }`}
              onClick={() => setCurrentQ(idx)}
            >
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData[q.key] ?? ""}
                placeholder={q.placeholder}
                onChange={(e) => set(q.key, e.target.value)}
                onFocus={() => setCurrentQ(idx)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-[#1A365D] focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Download guard */}
        <div className="border-t border-slate-100 p-4 space-y-2">
          <p className="text-xs text-slate-500 text-center">
            {completedMandatory} of {MANDATORY_FIELDS.length} required fields completed
          </p>
          <button
            disabled={!canDownload}
            onClick={handleDownload}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${canDownload
                ? "text-white hover:opacity-90"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            style={canDownload ? { background: "var(--color-trust)" } : {}}
          >
            {canDownload ? "Download Draft PDF" : "Complete required fields to download"}
          </button>
        </div>
      </div>

      {/* Right — Live PDF Preview (60%) */}
      <div className="flex w-3/5 flex-col bg-slate-50">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">I-485 Preview — Part 1</h2>
          <p className="text-xs text-slate-500 mt-0.5">Updates as you type</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm space-y-4 font-mono text-sm">
            <div className="text-center border-b border-slate-200 pb-3">
              <p className="font-bold text-slate-900">Form I-485 — Application to Register Permanent Residence</p>
              <p className="text-xs text-slate-500">Edition 01/20/25 · Department of Homeland Security</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Part 1. Information About You</p>
              {QUESTIONS.map((q) => (
                <div key={q.key} className="flex gap-3 border-b border-slate-100 pb-2">
                  <span className="w-40 shrink-0 text-xs text-slate-500">{q.label}:</span>
                  <span className={`text-xs font-medium ${formData[q.key] ? "text-slate-900" : "text-slate-300"}`}>
                    {formData[q.key] || "———"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface FormPackSummary {
  id: string;
  label: string;
  detailLabel: string;
  coverPdfUrl: string;
  uscisUrl: string;
}

interface SubmissionClientProps {
  formPacks: FormPackSummary[];
}

const CHECKLIST_ITEMS = [
  "All forms are signed and dated (no blanks left on required fields)",
  "Form edition dates are current — check each form's bottom-right edition date",
  "All required supporting documents are included (marriage certificate, I-94, passport copies, etc.)",
  "Filing fees are attached in the correct amount (check/money order payable to U.S. Department of Homeland Security)",
  "I-693 medical exam sealed envelope is included (do not open the envelope)",
  "Correct USCIS lockbox address is confirmed at USCIS.gov for your state and filing type",
  "You have read the Advance Parole travel warning above and understand the travel restriction",
];

export function SubmissionClient({ formPacks }: SubmissionClientProps) {
  const [checked, setChecked] = useState<boolean[]>(
    () => Array(CHECKLIST_ITEMS.length).fill(false)
  );

  const allChecked = checked.every(Boolean);

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  return (
    <div className="flex flex-col gap-8">

      {/* SUB-04: AP Travel Warning — must appear first, per D-11 */}
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 text-sm"
        style={{
          background: "var(--color-warning-bg, #fffbeb)",
          borderLeftColor: "var(--color-warning-border, #fcd34d)",
          color: "var(--color-warning-text, #92400e)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mt-0.5 h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div>
          <p className="font-semibold">Do not travel without Advance Parole</p>
          <p className="mt-0.5">
            Do not travel outside the U.S. while your I-485 is pending without an approved
            Advance Parole document (Form I-131). Leaving without AP will typically abandon
            your application.
          </p>
        </div>
      </div>

      {/* SUB-01: Form Download List */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800">Download Your Forms</h2>
        <p className="mb-4 text-sm text-slate-500">
          Download each completed PDF below. Individual form links open on USCIS.gov
          if you need to verify the current edition.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {formPacks.map((pack, index) => (
            <div
              key={pack.id}
              className={`flex items-center justify-between px-4 py-3 ${
                index < formPacks.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <span className="text-sm font-medium text-slate-900">{pack.detailLabel}</span>
              <div className="flex items-center gap-4">
                <a
                  href={pack.coverPdfUrl}
                  download
                  className="text-sm font-medium text-slate-900 underline decoration-slate-300 hover:decoration-slate-600"
                >
                  Download PDF
                </a>
                <a
                  href={pack.uscisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-slate-600 hover:underline"
                >
                  USCIS.gov
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUB-02: Packet Assembly Checklist */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800">Packet Assembly Checklist</h2>
        <p className="mb-4 text-sm text-slate-500">
          Check each item before mailing. Checklist state is not saved — complete it
          during your final assembly session.
        </p>
        <div className="flex flex-col gap-2">
          {CHECKLIST_ITEMS.map((item, index) => (
            <label
              key={index}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => toggle(index)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-slate-800"
              />
              <span className={checked[index] ? "text-slate-400 line-through" : ""}>{item}</span>
            </label>
          ))}
        </div>
        {allChecked ? (
          <p className="mt-3 text-sm font-semibold text-green-700">
            All items checked — your packet is ready to mail.
          </p>
        ) : null}
      </section>

      {/* SUB-03: USCIS Lockbox Link — per D-10, never hardcode an address */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-slate-800">USCIS Lockbox Address</h2>
        <p className="mb-3 text-sm text-slate-600">
          USCIS lockbox mailing addresses vary by state and filing type and change
          periodically. Always confirm the correct address on USCIS.gov before mailing.
          Never use an address from a third-party source.
        </p>
        <a
          href="https://www.uscis.gov/i-485"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
        >
          Find the current I-485 filing address on USCIS.gov
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </section>

    </div>
  );
}

"use client";

import { STRUCTURED_FIELD_LABELS } from "./types";

type IntakeSummaryProps = {
  extractedData: Record<string, string>;
};

export function IntakeSummary({ extractedData }: IntakeSummaryProps) {
  const entries = Object.entries(extractedData).filter(
    ([, value]) => String(value).trim().length > 0
  );
  const totalFields = Object.keys(STRUCTURED_FIELD_LABELS).length;
  const progress = `${entries.length}/${totalFields}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">Intake summary</h2>
        <span className="text-xs font-semibold text-black">{progress}</span>
      </div>
      <div className="space-y-2 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black">
              {STRUCTURED_FIELD_LABELS[key] ?? key}
            </p>
            <p className="mt-1 text-slate-700">{value}</p>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-slate-600">No relevant data collected yet.</p>
        )}
      </div>
    </div>
  );
}

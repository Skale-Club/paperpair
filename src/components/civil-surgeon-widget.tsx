"use client";

import { useState } from "react";

type CivilSurgeon = {
  name: string;
  clinic: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

export function CivilSurgeonWidget() {
  const [zip, setZip] = useState("");
  const [results, setResults] = useState<CivilSurgeon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setError(null);
    setSearched(false);
    if (!/^\d{5}$/.test(zip.trim())) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/civil-surgeons?zip=${zip.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setResults([]);
      } else {
        setResults(data.results ?? []);
        setSearched(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🏥</span>
        <div>
          <h3 className="text-base font-bold text-slate-900">Find a Civil Surgeon (I-693)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your medical exam must be performed by a USCIS-authorized civil surgeon.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          maxLength={5}
          placeholder="Enter your zip code..."
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#1A365D] focus:outline-none"
        />
        <button
          onClick={search}
          disabled={loading}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--color-trust)" }}
        >
          {loading ? "Searching..." : "Find Surgeons"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {searched && results.length > 0 && (
        <ul className="space-y-3">
          {results.map((surgeon, i) => (
            <li key={surgeon.name} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400 mb-1">#{i + 1}</p>
              <p className="text-sm font-bold" style={{ color: "var(--color-trust)" }}>
                {surgeon.name}
              </p>
              <p className="text-sm text-slate-700">{surgeon.clinic}</p>
              <p className="text-xs text-slate-500 mt-1">
                {surgeon.address}, {surgeon.city}, {surgeon.state} {surgeon.zip}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${surgeon.phone.replace(/\D/g, "")}`}
                  className="text-xs font-semibold underline"
                  style={{ color: "var(--color-trust)" }}
                >
                  {surgeon.phone}
                </a>
                <a
                  href="https://www.uscis.gov/tools/find-a-civil-surgeon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Verify at uscis.gov →
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

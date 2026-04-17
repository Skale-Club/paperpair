"use client";

import { useState } from "react";
import { get125PercentThreshold } from "@/lib/poverty-guidelines";
import { cn } from "@/lib/utils";

interface IncomeCalculatorClientProps {
  existingData: Record<string, unknown>;
}

export function IncomeCalculatorClient({ existingData }: IncomeCalculatorClientProps) {
  const [householdSize, setHouseholdSize] = useState<number>(
    typeof existingData.householdSize === "number" ? existingData.householdSize : 2
  );
  const [annualIncome, setAnnualIncome] = useState<string>(
    typeof existingData.annualIncome === "number"
      ? String(existingData.annualIncome)
      : ""
  );
  const [result, setResult] = useState<{
    qualified: boolean;
    threshold: number;
    annualIncome: number;
    householdSize: number;
  } | null>(
    typeof existingData.qualified === "boolean" &&
    typeof existingData.threshold === "number" &&
    typeof existingData.annualIncome === "number"
      ? {
          qualified: existingData.qualified as boolean,
          threshold: existingData.threshold as number,
          annualIncome: existingData.annualIncome as number,
          householdSize: existingData.householdSize as number,
        }
      : null
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleCalculate() {
    const incomeNum = parseFloat(annualIncome.replace(/,/g, ""));
    if (isNaN(incomeNum) || incomeNum < 0) {
      setSaveError("Please enter a valid annual income.");
      return;
    }

    const threshold = get125PercentThreshold(householdSize);
    const qualified = incomeNum >= threshold;

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/dashboard/steps", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepSlug: "income-calculator",
          status: "IN_PROGRESS",
          data: {
            qualified,
            threshold,
            householdSize,
            annualIncome: incomeNum,
          },
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to save result.");
      }

      setResult({ qualified, threshold, annualIncome: incomeNum, householdSize });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save result.");
    } finally {
      setSaving(false);
    }
  }

  const formattedThreshold = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col gap-6">
      {/* Input card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Petitioner Household</h2>

        {/* Household size */}
        <div className="mb-4">
          <label htmlFor="household-size" className="mb-1.5 block text-sm font-medium text-slate-700">
            Household size (including petitioner + beneficiary)
          </label>
          <select
            id="household-size"
            value={householdSize}
            onChange={(e) => setHouseholdSize(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>

        {/* Annual income */}
        <div className="mb-5">
          <label htmlFor="annual-income" className="mb-1.5 block text-sm font-medium text-slate-700">
            Petitioner annual income (before taxes)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
            <input
              id="annual-income"
              type="text"
              inputMode="numeric"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {saveError ? (
          <p className="mb-3 text-xs text-red-600">{saveError}</p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleCalculate()}
          disabled={saving}
          className={cn(
            "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
            saving
              ? "cursor-not-allowed bg-slate-300"
              : "bg-slate-900 hover:bg-slate-700"
          )}
        >
          {saving ? "Saving..." : "Calculate"}
        </button>
      </div>

      {/* Result card */}
      {result ? (
        <div
          className={cn(
            "rounded-xl border-l-4 p-5",
            result.qualified
              ? "border-green-500 bg-green-50"
              : "border-red-400 bg-red-50"
          )}
        >
          <p className={cn("mb-1 text-base font-bold", result.qualified ? "text-green-800" : "text-red-800")}>
            {result.qualified ? "Income Qualifies" : "Income Does Not Qualify"}
          </p>
          <p className="mb-3 text-sm text-slate-700">
            Required minimum (125% FPG for {result.householdSize}{" "}
            {result.householdSize === 1 ? "person" : "people"}
            ):{" "}
            <span className="font-semibold">{formattedThreshold(result.threshold)}</span>
          </p>
          <p className="text-sm text-slate-700">
            Your income:{" "}
            <span className="font-semibold">{formattedThreshold(result.annualIncome)}</span>
          </p>

          {/* Joint sponsor explanation — per D-05 */}
          {!result.qualified ? (
            <div className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-700 shadow-sm">
              <p className="mb-2 font-semibold text-slate-800">Joint Sponsor Required</p>
              <p className="mb-2">
                Your income is below the minimum required to independently sponsor your
                beneficiary. You will need a joint sponsor — a U.S. citizen or permanent
                resident who agrees to take legal responsibility for the beneficiary alongside
                you.
              </p>
              <p className="mb-2">
                A joint sponsor must independently meet the 125% poverty threshold for{" "}
                <strong>their own household size</strong> — their income is not combined with
                yours. They will file a separate Form I-864 and may use Form I-864A if
                combining a household member&apos;s income.
              </p>
              <a
                href="https://www.uscis.gov/i-864"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-slate-900 underline hover:no-underline"
              >
                Read USCIS I-864 instructions for full eligibility rules
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Informational note */}
      <p className="text-xs text-slate-400">
        Based on 2026 HHS Federal Poverty Guidelines (48 contiguous states + D.C.).
        Updated annually in January/February.
      </p>
    </div>
  );
}

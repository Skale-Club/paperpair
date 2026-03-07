"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EntryType = "overstay" | "ewi";
type FilingReason = "married-to-usc" | "child-of-usc" | "parent-of-usc" | "other";

type Answers = {
  fullName: string;
  spouseName: string;
  country: string;
  filingReason: FilingReason | null;
  entryType: EntryType | null;
};

const STEP_COUNT = 5; // steps 1–5 (0 = welcome)

const toNameCase = (v: string) => v.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// ── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <span
          key={i}
          className={`block rounded-full transition-all duration-300 ${
            i + 1 < current
              ? "h-2 w-2 bg-white"
              : i + 1 === current
                ? "h-2 w-5 bg-white"
                : "h-2 w-2 bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

// ── Next button ───────────────────────────────────────────────────────────────
function NextButton({
  onClick,
  disabled,
  label = "Next →",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full rounded-xl bg-[var(--color-trust)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <p className="mb-3 text-4xl">👋</p>
      <h3 className="text-xl font-bold text-slate-900">Welcome to PaperPaired</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        We&apos;ll help you file your immigration paperwork with confidence —
        no lawyers required. Answer a few quick questions and we&apos;ll
        personalize your dashboard so you always know what to do next.
      </p>
      <p className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800 leading-relaxed text-left">
        <span className="font-semibold">One account is all you need.</span> Only one partner needs to create an account and manage the steps — there&apos;s no need for your spouse to sign up separately.
      </p>
      <p className="mt-2 text-xs text-slate-400">Takes about 2 minutes.</p>
      <NextButton onClick={onNext} label="Get Started →" />
    </div>
  );
}

// ── Step 1: Full name ─────────────────────────────────────────────────────────
function NameStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">What&apos;s your full legal name?</h3>
      <p className="mt-1 text-sm text-slate-500">
        This is the name of the person who will be filling out and managing the steps in this app.
      </p>
      <p className="mt-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800 leading-relaxed">
        <span className="font-semibold">Legal full name</span> — enter it exactly as it appears on your passport or government-issued ID, including middle name if applicable.
      </p>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(toNameCase(e.target.value))}
        placeholder="e.g. María Elena García López"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20"
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onNext()}
      />
      <NextButton onClick={onNext} disabled={!value.trim()} />
    </div>
  );
}

// ── Step 2: Spouse's name ─────────────────────────────────────────────────────
function SpouseNameStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">What is your spouse&apos;s full legal name?</h3>
      <p className="mt-1 text-sm text-slate-500">
        This is the name of the other partner in the application.
      </p>
      <p className="mt-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800 leading-relaxed">
        <span className="font-semibold">Legal full name</span> — enter it exactly as it appears on their passport or government-issued ID, including middle name if applicable.
      </p>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(toNameCase(e.target.value))}
        placeholder="e.g. James Robert Smith"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20"
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onNext()}
      />
      <NextButton onClick={onNext} disabled={!value.trim()} />
    </div>
  );
}

// ── Step 3: Country of birth ──────────────────────────────────────────────────
function CountryStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">What is your country of birth?</h3>
      <p className="mt-1 text-sm text-slate-500">This helps us tailor your case information.</p>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Mexico, El Salvador, India…"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20"
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onNext()}
      />
      <NextButton onClick={onNext} disabled={!value.trim()} />
    </div>
  );
}

// ── Step 3: Reason for filing ─────────────────────────────────────────────────
const FILING_REASONS: {
  id: FilingReason;
  emoji: string;
  label: string;
  description: string;
}[] = [
  {
    id: "married-to-usc",
    emoji: "💍",
    label: "Married to a U.S. Citizen",
    description: "Spousal petition — I-130 + I-485 concurrent filing.",
  },
  {
    id: "child-of-usc",
    emoji: "👶",
    label: "Child of a U.S. Citizen",
    description: "Immediate relative petition for unmarried children.",
  },
  {
    id: "parent-of-usc",
    emoji: "👨‍👩‍👧",
    label: "Parent of a U.S. Citizen (21+)",
    description: "Immediate relative petition for parents.",
  },
  {
    id: "other",
    emoji: "📋",
    label: "Other basis",
    description: "Different eligibility category or not sure yet.",
  },
];

function FilingReasonStep({
  selected,
  onSelect,
}: {
  selected: FilingReason | null;
  onSelect: (v: FilingReason) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">Why are you filing for a green card?</h3>
      <p className="mt-1 text-sm text-slate-500">Select the option that best describes your situation.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {FILING_REASONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className={`flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition hover:border-[var(--color-trust)] hover:bg-blue-50 ${
              selected === r.id
                ? "border-[var(--color-trust)] bg-blue-50"
                : "border-slate-200"
            }`}
          >
            <span className="text-xl">{r.emoji}</span>
            <span className="text-sm font-semibold text-slate-900">{r.label}</span>
            <span className="text-xs leading-relaxed text-slate-500">{r.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 4: Entry type ────────────────────────────────────────────────────────
function EntryTypeStep({
  selected,
  onSelect,
  onFinish,
  saving,
  errorMessage,
}: {
  selected: EntryType | null;
  onSelect: (v: EntryType) => void;
  onFinish: () => void;
  saving: boolean;
  errorMessage: string | null;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">How did you enter the United States?</h3>
      <p className="mt-1 text-sm text-slate-500">This affects which forms and steps apply to your case.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("overstay")}
          disabled={saving}
          className={`flex flex-col gap-2 rounded-xl border-2 p-5 text-left transition hover:border-[var(--color-trust)] hover:bg-blue-50 disabled:cursor-not-allowed ${
            selected === "overstay"
              ? "border-[var(--color-trust)] bg-blue-50"
              : "border-slate-200"
          }`}
        >
          <span className="text-2xl">✈️</span>
          <span className="text-sm font-bold text-slate-900">Visa Overstay</span>
          <span className="text-xs leading-relaxed text-slate-500">
            I entered legally with a visa and stayed past my authorized period.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("ewi")}
          disabled={saving}
          className={`flex flex-col gap-2 rounded-xl border-2 p-5 text-left transition hover:border-[var(--color-trust)] hover:bg-blue-50 disabled:cursor-not-allowed ${
            selected === "ewi"
              ? "border-[var(--color-trust)] bg-blue-50"
              : "border-slate-200"
          }`}
        >
          <span className="text-2xl">🚶</span>
          <span className="text-sm font-bold text-slate-900">Entry Without Inspection (EWI)</span>
          <span className="text-xs leading-relaxed text-slate-500">
            I entered without being inspected by a border officer.
          </span>
        </button>
      </div>

      {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}

      <NextButton
        onClick={onFinish}
        disabled={!selected || saving}
        label={saving ? "Saving your profile…" : "Finish Setup →"}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function InitialScreener() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Answers>({
    fullName: "",
    spouseName: "",
    country: "",
    filingReason: null,
    entryType: null,
  });

  useEffect(() => {
    const seen = localStorage.getItem("screener_done");
    if (!seen) setOpen(true);
  }, []);

  const goNext = () => setStep((s) => s + 1);

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/dashboard/steps", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepSlug: "immigration-info",
          status: "IN_PROGRESS",
          data: {
            fullName: answers.fullName,
            spouseName: answers.spouseName,
            country: answers.country,
            filingReason: answers.filingReason,
            entryType: answers.entryType,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (response.status === 401) throw new Error("Please sign in again to save your profile.");
        throw new Error(body?.error ?? "Failed to save your profile.");
      }

      localStorage.setItem("case_type", answers.entryType ?? "");
      localStorage.setItem("screener_done", "true");
      setOpen(false);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ background: "var(--color-trust)" }}>
          <div>
            <h2 className="text-xl font-bold text-white">PaperPaired</h2>
            <p className="mt-0.5 text-sm text-white/70">
              {step === 0 ? "Case Setup" : `Step ${step} of ${STEP_COUNT}`}
            </p>
          </div>
          {step > 0 && <ProgressDots current={step} />}
        </div>

        {/* Step body */}
        <div className="p-6">
          {step === 0 && <WelcomeStep onNext={goNext} />}
          {step === 1 && (
            <NameStep
              value={answers.fullName}
              onChange={(v) => setAnswers((a) => ({ ...a, fullName: v }))}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <SpouseNameStep
              value={answers.spouseName}
              onChange={(v) => setAnswers((a) => ({ ...a, spouseName: v }))}
              onNext={goNext}
            />
          )}
          {step === 3 && (
            <CountryStep
              value={answers.country}
              onChange={(v) => setAnswers((a) => ({ ...a, country: v }))}
              onNext={goNext}
            />
          )}
          {step === 4 && (
            <FilingReasonStep
              selected={answers.filingReason}
              onSelect={(v) => {
                setAnswers((a) => ({ ...a, filingReason: v }));
                goNext();
              }}
            />
          )}
          {step === 5 && (
            <EntryTypeStep
              selected={answers.entryType}
              onSelect={(v) => setAnswers((a) => ({ ...a, entryType: v }))}
              onFinish={finish}
              saving={saving}
              errorMessage={errorMessage}
            />
          )}
        </div>

        {/* Back link */}
        {step > 0 && step < 5 && (
          <div className="border-t border-slate-100 px-6 py-3 text-center">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

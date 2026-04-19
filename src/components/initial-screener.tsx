"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function EwiWarning() {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 text-sm"
      style={{
        background: "var(--color-warning-bg, #fffbeb)",
        borderLeftColor: "var(--color-warning-border, #f59e0b)",
        color: "var(--color-warning-text, #92400e)",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <div>
        <p className="font-semibold">Review your eligibility</p>
        <p className="mt-0.5">Entering without inspection may affect your AOS eligibility. We recommend consulting a licensed immigration attorney before proceeding.</p>
      </div>
    </div>
  );
}

type EntryType = "overstay" | "ewi";
type FilingReason = "married-to-usc" | "child-of-usc" | "parent-of-usc" | "other";

type Answers = {
  fullName: string;
  spouseName: string;
  spouseEmail: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  spouseBirthCity: string;
  spouseBirthState: string;
  spouseBirthCountry: string;
  filingReason: FilingReason | null;
  entryType: EntryType | null;
};

type InitialScreenerProps = {
  initialData?: Record<string, unknown>;
};

const STEP_COUNT = 8;
const DRAFT_STORAGE_KEY = "paperpair.initialScreenerDraft";

const toNameCase = (value: string) => value.replace(/(^|\s)\S/g, (chunk) => chunk.toUpperCase());

function isFilingReason(value: unknown): value is FilingReason {
  return value === "married-to-usc" || value === "child-of-usc" || value === "parent-of-usc" || value === "other";
}

function isEntryType(value: unknown): value is EntryType {
  return value === "overstay" || value === "ewi";
}

function sanitizeAnswers(source?: Record<string, unknown>): Answers {
  const safeString = (key: keyof Omit<Answers, "filingReason" | "entryType">) => {
    const value = source?.[key];
    return typeof value === "string" ? value : "";
  };

  return {
    fullName: safeString("fullName"),
    spouseName: safeString("spouseName"),
    spouseEmail: safeString("spouseEmail"),
    birthCity: safeString("birthCity"),
    birthState: safeString("birthState"),
    birthCountry: safeString("birthCountry"),
    spouseBirthCity: safeString("spouseBirthCity"),
    spouseBirthState: safeString("spouseBirthState"),
    spouseBirthCountry: safeString("spouseBirthCountry"),
    filingReason: isFilingReason(source?.filingReason) ? source.filingReason : null,
    entryType: isEntryType(source?.entryType) ? source.entryType : null,
  };
}

function hasDraftContent(answers: Answers) {
  return Boolean(
    answers.fullName ||
      answers.spouseName ||
      answers.spouseEmail ||
      answers.birthCity ||
      answers.birthState ||
      answers.birthCountry ||
      answers.spouseBirthCity ||
      answers.spouseBirthState ||
      answers.spouseBirthCountry ||
      answers.filingReason ||
      answers.entryType
  );
}

function getResumeStep(answers: Answers) {
  if (!hasDraftContent(answers)) return 0;
  if (!answers.fullName.trim()) return 1;
  if (!answers.spouseName.trim()) return 2;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.spouseEmail.trim())) return 3;
  if (!answers.birthCity.trim() || !answers.birthState.trim() || !answers.birthCountry.trim()) return 4;
  if (!answers.spouseBirthCity.trim() || !answers.spouseBirthState.trim() || !answers.spouseBirthCountry.trim()) return 5;
  if (!answers.filingReason) return 6;
  if (!answers.entryType) return 7;
  return 7;
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: STEP_COUNT }).map((_, index) => (
        <span
          key={index}
          className={`block rounded-full transition-all duration-300 ${
            index + 1 < current
              ? "h-2 w-2 bg-white"
              : index + 1 === current
                ? "h-2 w-5 bg-white"
                : "h-2 w-2 bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
  label = "Next ->",
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

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <p className="mb-3 text-4xl">Hi</p>
      <h3 className="text-xl font-bold text-slate-900">Welcome to PaperPaired</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        We will help you file your immigration paperwork with confidence. Answer a few quick
        questions and we will personalize your dashboard so you always know what to do next.
      </p>
      <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-left text-xs leading-relaxed text-blue-800">
        <span className="font-semibold">One account is all you need.</span> Only one partner needs
        to create an account and manage the steps. Your spouse does not need a separate signup.
      </p>
      <p className="mt-2 text-xs text-slate-400">Takes about 2 minutes.</p>
      <NextButton onClick={onNext} label="Get Started ->" />
    </div>
  );
}

function NameStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const canContinue = value.trim().length > 0;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">What&apos;s your full legal name?</h3>
      <p className="mt-1 text-sm text-slate-500">
        This is the name of the person who will be filling out and managing the steps in this app.
      </p>
      <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
        <span className="font-semibold">Legal full name</span> - enter it exactly as it appears on
        your passport or government-issued ID, including middle name if applicable.
      </p>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(event) => onChange(toNameCase(event.target.value))}
        placeholder="e.g. Maria Elena Garcia Lopez"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20"
        onKeyDown={(event) => event.key === "Enter" && canContinue && onNext()}
      />
      <NextButton onClick={onNext} disabled={!canContinue} />
    </div>
  );
}

function EmailStep({
  title,
  subtitle,
  value,
  onChange,
  onNext,
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <input
        type="email"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. name@example.com"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20"
        onKeyDown={(event) => event.key === "Enter" && valid && onNext()}
      />
      <NextButton onClick={onNext} disabled={!valid} />
    </div>
  );
}

function SpouseNameStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const canContinue = value.trim().length > 0;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">What is your spouse&apos;s full legal name?</h3>
      <p className="mt-1 text-sm text-slate-500">
        This is the name of the other partner in the application.
      </p>
      <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
        <span className="font-semibold">Legal full name</span> - enter it exactly as it appears on
        their passport or government-issued ID, including middle name if applicable.
      </p>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(event) => onChange(toNameCase(event.target.value))}
        placeholder="e.g. James Robert Smith"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20"
        onKeyDown={(event) => event.key === "Enter" && canContinue && onNext()}
      />
      <NextButton onClick={onNext} disabled={!canContinue} />
    </div>
  );
}

function PlaceOfBirthStep({
  title,
  subtitle,
  city,
  state,
  country,
  onChangeCity,
  onChangeState,
  onChangeCountry,
  onNext,
}: {
  title: string;
  subtitle: string;
  city: string;
  state: string;
  country: string;
  onChangeCity: (value: string) => void;
  onChangeState: (value: string) => void;
  onChangeCountry: (value: string) => void;
  onNext: () => void;
}) {
  const isValid = city.trim() && state.trim() && country.trim();
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-trust)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)]/20";

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
        All fields in this step are required and should match the official record exactly.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">City</label>
          <input
            type="text"
            autoFocus
            value={city}
            onChange={(event) => onChangeCity(event.target.value)}
            placeholder="e.g. Guadalajara"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">State / Province</label>
          <input
            type="text"
            value={state}
            onChange={(event) => onChangeState(event.target.value)}
            placeholder="e.g. Jalisco"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Country</label>
          <input
            type="text"
            value={country}
            onChange={(event) => onChangeCountry(event.target.value)}
            placeholder="e.g. Mexico"
            className={inputClass}
            onKeyDown={(event) => event.key === "Enter" && isValid && onNext()}
          />
        </div>
      </div>
      <NextButton onClick={onNext} disabled={!isValid} />
    </div>
  );
}

const FILING_REASONS: Array<{
  id: FilingReason;
  emoji: string;
  label: string;
  description: string;
}> = [
  {
    id: "married-to-usc",
    emoji: "USC",
    label: "Married to a U.S. Citizen",
    description: "Spousal petition with concurrent filing.",
  },
  {
    id: "child-of-usc",
    emoji: "Child",
    label: "Child of a U.S. Citizen",
    description: "Immediate relative petition for unmarried children.",
  },
  {
    id: "parent-of-usc",
    emoji: "Parent",
    label: "Parent of a U.S. Citizen (21+)",
    description: "Immediate relative petition for parents.",
  },
  {
    id: "other",
    emoji: "Other",
    label: "Other basis",
    description: "Different eligibility category or not sure yet.",
  },
];

function FilingReasonStep({
  selected,
  onSelect,
}: {
  selected: FilingReason | null;
  onSelect: (value: FilingReason) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">Why are you filing for a green card?</h3>
      <p className="mt-1 text-sm text-slate-500">Select the option that best describes your situation.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {FILING_REASONS.map((reason) => (
          <button
            key={reason.id}
            type="button"
            onClick={() => onSelect(reason.id)}
            className={`flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition hover:border-[var(--color-trust)] hover:bg-blue-50 ${
              selected === reason.id ? "border-[var(--color-trust)] bg-blue-50" : "border-slate-200"
            }`}
          >
            <span className="text-sm font-semibold text-slate-500">{reason.emoji}</span>
            <span className="text-sm font-semibold text-slate-900">{reason.label}</span>
            <span className="text-xs leading-relaxed text-slate-500">{reason.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EntryTypeStep({
  selected,
  onSelect,
  onFinish,
  saving,
  errorMessage,
}: {
  selected: EntryType | null;
  onSelect: (value: EntryType) => void;
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
            selected === "overstay" ? "border-[var(--color-trust)] bg-blue-50" : "border-slate-200"
          }`}
        >
          <span className="text-sm font-semibold text-slate-500">Legal entry</span>
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
            selected === "ewi" ? "border-[var(--color-trust)] bg-blue-50" : "border-slate-200"
          }`}
        >
          <span className="text-sm font-semibold text-slate-500">No inspection</span>
          <span className="text-sm font-bold text-slate-900">Entry Without Inspection (EWI)</span>
          <span className="text-xs leading-relaxed text-slate-500">
            I entered without being inspected by a border officer.
          </span>
        </button>
      </div>

      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}

      <NextButton
        onClick={onFinish}
        disabled={!selected || saving}
        label={saving ? "Saving..." : "Continue to my case"}
      />
    </div>
  );
}

export function InitialScreener({ initialData = {} }: InitialScreenerProps) {
  const router = useRouter();
  const initialDataRef = useRef(initialData);
  const hydratedRef = useRef(false);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [answers, setAnswers] = useState<Answers>(() => sanitizeAnswers(initialData));
  const [step, setStep] = useState(() => getResumeStep(sanitizeAnswers(initialData)));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  useEffect(() => {
    const localDraftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!localDraftRaw) {
      hydratedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(localDraftRaw) as Record<string, unknown>;
      const mergedAnswers = {
        ...sanitizeAnswers(initialDataRef.current),
        ...sanitizeAnswers(parsed),
      };
      setAnswers(mergedAnswers);
      setStep(getResumeStep(mergedAnswers));
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;

    if (!hasDraftContent(answers)) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (!hydratedRef.current || !hasDraftContent(answers)) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      setDraftState("saving");

      try {
        const response = await fetch("/api/dashboard/steps", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepSlug: "immigration-info",
            status: "IN_PROGRESS",
            data: {
              ...initialDataRef.current,
              ...answers,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Could not save draft");
        }

        setDraftState("saved");
      } catch {
        setDraftState("error");
      }
    }, 600);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [answers]);

  const goNext = () => setStep((currentStep) => currentStep + 1);

  async function finish() {
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
            ...initialDataRef.current,
            ...answers,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (response.status === 401) throw new Error("Please sign in again to save your profile.");
        throw new Error(body?.error ?? "Failed to save your profile.");
      }

      if (answers.spouseEmail && answers.spouseName) {
        fetch("/api/invite/spouse", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spouseEmail: answers.spouseEmail,
            spouseName: answers.spouseName,
          }),
        }).catch(() => {
          // Invite can be resent later; do not block completion.
        });
      }

      localStorage.setItem("case_type", answers.entryType ?? "");
      localStorage.setItem("screener_done", "true");
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-md backdrop-saturate-75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paperpaired-setup-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_32px_120px_rgba(15,23,42,0.55)]">
        <div className="flex items-center justify-between px-6 py-5" style={{ background: "var(--color-trust)" }}>
          <div>
            <h2 id="paperpaired-setup-title" className="text-xl font-bold text-white">PaperPaired</h2>
            <p className="mt-0.5 text-sm text-white/70">
              {step === 0 ? "Case Setup" : `Step ${step} of ${STEP_COUNT}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {step > 0 ? <ProgressDots current={step} /> : null}
          </div>
        </div>

        <div className="border-b border-slate-100 bg-slate-50 px-6 py-2 text-xs text-slate-500">
          {draftState === "saving" ? "Saving draft..." : null}
          {draftState === "saved" ? "Draft saved automatically" : null}
          {draftState === "error" ? "Draft could not be saved to the server yet. Local draft kept on this device." : null}
          {draftState === "idle" ? "Your answers are kept as a draft while you fill this out." : null}
        </div>

        <div className="p-6">
          {step === 0 ? <WelcomeStep onNext={goNext} /> : null}
          {step === 1 ? (
            <NameStep
              value={answers.fullName}
              onChange={(value) => setAnswers((current) => ({ ...current, fullName: value }))}
              onNext={goNext}
            />
          ) : null}
          {step === 2 ? (
            <SpouseNameStep
              value={answers.spouseName}
              onChange={(value) => setAnswers((current) => ({ ...current, spouseName: value }))}
              onNext={goNext}
            />
          ) : null}
          {step === 3 ? (
            <EmailStep
              title="What is your spouse's email address?"
              subtitle="We will use this to keep them in the loop on the process."
              value={answers.spouseEmail}
              onChange={(value) => setAnswers((current) => ({ ...current, spouseEmail: value }))}
              onNext={goNext}
            />
          ) : null}
          {step === 4 ? (
            <PlaceOfBirthStep
              title="What is your place of birth?"
              subtitle="Enter where you were born. This appears on immigration forms."
              city={answers.birthCity}
              state={answers.birthState}
              country={answers.birthCountry}
              onChangeCity={(value) => setAnswers((current) => ({ ...current, birthCity: value }))}
              onChangeState={(value) => setAnswers((current) => ({ ...current, birthState: value }))}
              onChangeCountry={(value) => setAnswers((current) => ({ ...current, birthCountry: value }))}
              onNext={goNext}
            />
          ) : null}
          {step === 5 ? (
            <PlaceOfBirthStep
              title="What is your spouse's place of birth?"
              subtitle="Enter where your spouse was born."
              city={answers.spouseBirthCity}
              state={answers.spouseBirthState}
              country={answers.spouseBirthCountry}
              onChangeCity={(value) => setAnswers((current) => ({ ...current, spouseBirthCity: value }))}
              onChangeState={(value) => setAnswers((current) => ({ ...current, spouseBirthState: value }))}
              onChangeCountry={(value) => setAnswers((current) => ({ ...current, spouseBirthCountry: value }))}
              onNext={goNext}
            />
          ) : null}
          {step === 6 ? (
            <FilingReasonStep
              selected={answers.filingReason}
              onSelect={(value) => {
                setAnswers((current) => ({ ...current, filingReason: value }));
                goNext();
              }}
            />
          ) : null}
          {step === 7 ? (
            <EntryTypeStep
              selected={answers.entryType}
              onSelect={(value) => setAnswers((current) => ({ ...current, entryType: value }))}
              onFinish={finish}
              saving={saving}
              errorMessage={errorMessage}
            />
          ) : null}
        </div>

        {step > 0 && step < 7 ? (
          <div className="border-t border-slate-100 px-6 py-3 text-center">
            <button
              type="button"
              onClick={() => setStep((currentStep) => currentStep - 1)}
              className="text-xs text-slate-400 transition hover:text-slate-600"
            >
              {"<-"} Back
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

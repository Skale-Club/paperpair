// src/components/upl-disclaimer.tsx
// Server Component — no client directive needed

export function UplDisclaimer() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-l-4 border-[var(--color-trust-muted)] border-l-[var(--color-trust)] bg-[var(--color-trust-muted)]/40 px-4 py-3"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0 text-[var(--color-trust)] mt-0.5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-[var(--color-muted)]">
        <span className="font-bold">
          PaperPair provides general information only — not legal advice.
        </span>{" "}
        Always consult a qualified immigration attorney for your specific situation.
      </p>
    </div>
  );
}

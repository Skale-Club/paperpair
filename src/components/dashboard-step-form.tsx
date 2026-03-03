"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { DashboardStepSlug } from "@/lib/dashboard-steps";

type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "date" | "tel";
  placeholder?: string;
  required?: boolean;
};

type Props = {
  stepSlug: DashboardStepSlug;
  fields: Field[];
  initialData?: Record<string, unknown>;
  nextStepSlug?: DashboardStepSlug;
};

function normalizeInitialData(
  fields: Field[],
  initialData: Record<string, unknown>
): Record<string, string> {
  const output: Record<string, string> = {};

  for (const field of fields) {
    const value = initialData[field.name];

    if (typeof value === "string") {
      output[field.name] = value;
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      output[field.name] = String(value);
    }
  }

  return output;
}

export function DashboardStepForm({ stepSlug, fields, initialData = {}, nextStepSlug }: Props) {
  const router = useRouter();

  const normalizedInitialData = useMemo(
    () => normalizeInitialData(fields, initialData),
    [fields, initialData]
  );

  const [formData, setFormData] = useState<Record<string, string>>(normalizedInitialData);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    setFormData(normalizedInitialData);
  }, [normalizedInitialData]);

  const persist = useCallback(
    async (status: "IN_PROGRESS" | "COMPLETED") => {
      const response = await fetch("/api/dashboard/steps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepSlug,
          status,
          data: formData
        })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to save step.");
      }
    },
    [formData, stepSlug]
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const timeout = setTimeout(async () => {
      setSaveStatus("saving");
      setErrorMessage(null);

      try {
        await persist("IN_PROGRESS");
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [formData, persist]);

  const handleChange = (name: string, value: string) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleNext = async () => {
    const missingRequired = fields.some(
      (field) => field.required && !String(formData[field.name] ?? "").trim()
    );

    if (missingRequired) {
      setErrorMessage("Fill the required fields before continuing.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await persist("COMPLETED");
      router.push(nextStepSlug ? `/dashboard/${nextStepSlug}` : "/dashboard/review");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to finish the step.";
      setErrorMessage(message);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={field.name}>
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>

            <Input
              id={field.name}
              type={field.type}
              value={formData[field.name] ?? ""}
              onChange={(event) => handleChange(field.name, event.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        ))}
      </div>

      {saveStatus === "saving" && <p className="text-sm text-slate-600">Saving draft...</p>}
      {saveStatus === "saved" && <p className="text-sm text-green-600">Draft saved.</p>}
      {saveStatus === "error" && (
        <p className="text-sm text-red-600">Auto-save failed. Please try again.</p>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleNext} disabled={saving}>
          {saving ? "Saving..." : nextStepSlug ? "Next Step" : "Finish"}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Save and continue later
        </button>
      </div>
    </div>
  );
}

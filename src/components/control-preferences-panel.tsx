"use client";

import { useEffect, useState } from "react";

type LightingMode = "soft" | "focus" | "night";
type NotificationMode = "live" | "digest" | "minimal";
type LayoutMode = "traditional" | "streamlined";

type PreferenceState = {
  lighting: LightingMode;
  sounds: boolean;
  notifications: NotificationMode;
  layout: LayoutMode;
};

const defaultPreferences: PreferenceState = {
  lighting: "soft",
  sounds: true,
  notifications: "digest",
  layout: "traditional"
};

const lightingOptions: Array<{ value: LightingMode; label: string; description: string }> = [
  { value: "soft", label: "Soft", description: "Balanced lighting for everyday use." },
  { value: "focus", label: "Focus", description: "Higher contrast for long work sessions." },
  { value: "night", label: "Night", description: "Low-glare mode for late hours." }
];

const notificationOptions: Array<{ value: NotificationMode; label: string; description: string }> = [
  { value: "live", label: "Live", description: "See updates as soon as they happen." },
  { value: "digest", label: "Digest", description: "Bundle updates into a calmer feed." },
  { value: "minimal", label: "Minimal", description: "Show only critical alerts." }
];

const layoutOptions: Array<{ value: LayoutMode; label: string; description: string }> = [
  { value: "traditional", label: "Traditional", description: "Familiar panels and standard controls." },
  { value: "streamlined", label: "Streamlined", description: "Cleaner layout with fewer distractions." }
];

export function ControlPreferencesPanel({
  storageKey,
  audience
}: {
  storageKey: string;
  audience: "user" | "admin";
}) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const rawValue = window.localStorage.getItem(storageKey);
    if (rawValue) {
      try {
        const parsed = JSON.parse(rawValue) as Partial<PreferenceState>;
        setPreferences({
          lighting: parsed.lighting ?? defaultPreferences.lighting,
          sounds: parsed.sounds ?? defaultPreferences.sounds,
          notifications: parsed.notifications ?? defaultPreferences.notifications,
          layout: parsed.layout ?? defaultPreferences.layout
        });
      } catch {
        setPreferences(defaultPreferences);
      }
    }

    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [hydrated, preferences, storageKey]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Lighting</h2>
            <p className="text-sm text-slate-600">
              Tune the visual intensity for this {audience === "admin" ? "admin workstation" : "workspace"}.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
            {preferences.lighting}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {lightingOptions.map((option) => {
            const isActive = preferences.lighting === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, lighting: option.value }))}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className={`mt-2 text-xs leading-5 ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sounds</h2>
            <p className="text-sm text-slate-600">Control audible confirmations and alert tones.</p>
          </div>
          <button
            type="button"
            onClick={() => setPreferences((prev) => ({ ...prev, sounds: !prev.sounds }))}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
              preferences.sounds ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {preferences.sounds ? "Enabled" : "Muted"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Notification Center</h2>
        <p className="mt-1 text-sm text-slate-600">Choose how much activity the notification center should surface.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {notificationOptions.map((option) => {
            const isActive = preferences.notifications === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, notifications: option.value }))}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-sky-600 bg-sky-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Layout Style</h2>
        <p className="mt-1 text-sm text-slate-600">
          Keep the traditional layout or switch to a streamlined workspace.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {layoutOptions.map((option) => {
            const isActive = preferences.layout === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, layout: option.value }))}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-emerald-700 bg-emerald-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

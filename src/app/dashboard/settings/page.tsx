"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [language, setLanguage] = useState("en-US");

    const [googleApiKey, setGoogleApiKey] = useState("");
    const [hasExistingKey, setHasExistingKey] = useState(false);
    const [keyStatus, setKeyStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const [biometricLock, setBiometricLock] = useState(true);
    const [bioStatus, setBioStatus] = useState<"idle" | "saving" | "saved">("idle");

    useEffect(() => {
        fetch("/api/dashboard/settings")
            .then((r) => r.json())
            .then((data: { googleApiKey?: string | null; requireBiometricsForSensitiveDocs?: boolean }) => {
                if (data.googleApiKey) {
                    setHasExistingKey(true);
                }
                if (typeof data.requireBiometricsForSensitiveDocs === "boolean") {
                    setBiometricLock(data.requireBiometricsForSensitiveDocs);
                }
            })
            .catch(() => { });
    }, []);

    async function saveGoogleKey() {
        setKeyStatus("saving");
        try {
            const res = await fetch("/api/dashboard/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ googleApiKey: googleApiKey.trim() || null })
            });
            if (!res.ok) throw new Error();
            setKeyStatus("saved");
            setHasExistingKey(!!googleApiKey.trim());
            setGoogleApiKey("");
            setTimeout(() => setKeyStatus("idle"), 3000);
        } catch {
            setKeyStatus("error");
            setTimeout(() => setKeyStatus("idle"), 3000);
        }
    }

    async function removeGoogleKey() {
        setKeyStatus("saving");
        try {
            const res = await fetch("/api/dashboard/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ googleApiKey: null })
            });
            if (!res.ok) throw new Error();
            setHasExistingKey(false);
            setGoogleApiKey("");
            setKeyStatus("saved");
            setTimeout(() => setKeyStatus("idle"), 3000);
        } catch {
            setKeyStatus("error");
            setTimeout(() => setKeyStatus("idle"), 3000);
        }
    }

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Manage your account preferences.
                </p>
            </div>

            {/* Appearance */}
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
                <p className="text-sm text-slate-600">Choose how PaperPair looks for you.</p>

                <div className="flex gap-4">
                    <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${theme === "light"
                            ? "border-primary bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-slate-200 bg-white">
                            <span className="text-xl">☀️</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700">Light</span>
                    </button>

                    <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${theme === "dark"
                            ? "border-primary bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                            <span className="text-xl">🌙</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700">Dark</span>
                    </button>
                </div>
            </section>

            {/* Language */}
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Language</h2>
                <p className="text-sm text-slate-600">Choose the interface language.</p>

                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full max-w-xs appearance-none rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                    <option value="pt-BR">Portuguese (Brazil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Spanish</option>
                </select>
            </section>

            {/* Security */}
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                <p className="text-sm text-slate-600">
                    Control how sensitive documents are protected.
                </p>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                                Biometric lock for sensitive documents
                            </span>
                            {biometricLock && (
                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    Recommended
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Require Face ID, Touch ID, or Windows Hello to access Evidence Wall and Documents pages.
                        </p>
                        {bioStatus === "saved" && (
                            <p className="mt-1 text-xs text-emerald-600">Setting saved.</p>
                        )}
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={biometricLock}
                        onClick={() => {
                            const next = !biometricLock;
                            setBiometricLock(next);
                            setBioStatus("saving");
                            void fetch("/api/dashboard/settings", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ requireBiometricsForSensitiveDocs: next })
                            }).then(() => {
                                setBioStatus("saved");
                                setTimeout(() => setBioStatus("idle"), 2000);
                            });
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 ${biometricLock ? "bg-emerald-500" : "bg-slate-300"}`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${biometricLock ? "translate-x-5" : "translate-x-0.5"}`}
                        />
                    </button>
                </div>
            </section>

            {/* AI Assistant */}
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">AI Assistant</h2>
                <p className="text-sm text-slate-600">
                    Connect your Google AI API key to enable the AI chat assistant. Your key is encrypted
                    before storage and kept privately in Supabase.
                </p>

                {hasExistingKey && (
                    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                        <span className="text-sm text-green-800 font-medium">API key configured</span>
                        <button
                            onClick={removeGoogleKey}
                            disabled={keyStatus === "saving"}
                            className="text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                        >
                            Remove
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    <label htmlFor="google-key" className="block text-xs text-slate-600 ml-1">
                        {hasExistingKey ? "Replace key" : "Google AI API Key"}
                    </label>
                    <input
                        id="google-key"
                        type="password"
                        value={googleApiKey}
                        onChange={(e) => setGoogleApiKey(e.target.value)}
                        placeholder="AIza..."
                        className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={saveGoogleKey}
                            disabled={!googleApiKey.trim() || keyStatus === "saving"}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {keyStatus === "saving" ? "Saving..." : "Save key"}
                        </button>
                        {keyStatus === "saved" && (
                            <span className="text-sm text-green-600">Saved.</span>
                        )}
                        {keyStatus === "error" && (
                            <span className="text-sm text-red-600">Failed to save. Try again.</span>
                        )}
                    </div>
                </div>
            </section>

            {/* Account */}
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Account</h2>
                <p className="text-sm text-slate-600">Manage your account details.</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs text-slate-600 mb-1 ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            disabled
                            placeholder="Email on file"
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-slate-500 ml-1">
                            The email is tied to your Google account and cannot be changed here.
                        </p>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-5">
                <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                <p className="text-sm text-red-700">Irreversible actions for your account.</p>

                <button className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
                    Delete my account
                </button>
            </section>
        </div>
    );
}

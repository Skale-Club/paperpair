"use client";

import { useEffect, useState } from "react";

type Tab = "general" | "ai" | "security";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("general");
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
        <div className="space-y-8">
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">My Case</p>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="mt-1 text-sm text-slate-600 truncate">
                    Manage your account preferences and security.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "general" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                    General
                    {activeTab === "general" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-trust transition-all" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("ai")}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "ai" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                    AI Assistant
                    {activeTab === "ai" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-trust transition-all" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("security")}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "security" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                    Security & Account
                    {activeTab === "security" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-trust transition-all" />
                    )}
                </button>
            </div>

            <div className="pt-2">
                {activeTab === "general" && (
                    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Appearance */}
                        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">Appearance</h2>
                            <p className="text-sm text-slate-600">Choose how PaperPair looks for you.</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${theme === "light"
                                        ? "border-trust bg-trust/5 ring-1 ring-trust/20"
                                        : "border-slate-100 hover:border-slate-200"
                                        }`}
                                >
                                    <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                                        <span className="text-2xl">☀️</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Light Mode</span>
                                </button>

                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${theme === "dark"
                                        ? "border-trust bg-trust/5 ring-1 ring-trust/20"
                                        : "border-slate-100 hover:border-slate-200"
                                        }`}
                                >
                                    <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 shadow-sm">
                                        <span className="text-2xl">🌙</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Dark Mode</span>
                                </button>
                            </div>
                        </section>

                        {/* Language */}
                        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">Language</h2>
                            <p className="text-sm text-slate-600">Choose the interface language.</p>

                            <div className="relative max-w-sm">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 focus:border-trust focus:outline-none focus:ring-4 focus:ring-trust/5 transition-all"
                                >
                                    <option value="pt-BR">Portuguese (Brazil)</option>
                                    <option value="en-US">English (US)</option>
                                    <option value="es">Spanish</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "ai" && (
                    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* AI Assistant */}
                        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trust/10 text-trust">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Google AI Assistant</h2>
                                    <p className="text-sm text-slate-600">Power your case assistant with Gemini Pro.</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                Connect your Google AI API key to enable the AI chat assistant. Your key is stored with AES-256 encryption and kept privately in your secure profile.
                            </p>

                            {hasExistingKey && (
                                <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 ml-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-sm text-emerald-800 font-bold">API Key active and encrypted</span>
                                    </div>
                                    <button
                                        onClick={removeGoogleKey}
                                        disabled={keyStatus === "saving"}
                                        className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                                    >
                                        Revoke Access
                                    </button>
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <label htmlFor="google-key" className="block text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                                    {hasExistingKey ? "Replace with new key" : "Paste your Google AI API Key"}
                                </label>
                                <input
                                    id="google-key"
                                    type="password"
                                    value={googleApiKey}
                                    onChange={(e) => setGoogleApiKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-trust focus:outline-none focus:ring-4 focus:ring-trust/5 transition-all"
                                />
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={saveGoogleKey}
                                        disabled={!googleApiKey.trim() || keyStatus === "saving"}
                                        className="rounded-xl bg-trust px-6 py-2.5 text-sm font-bold text-white hover:bg-trust/90 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                                    >
                                        {keyStatus === "saving" ? "Saving..." : "Connect API Key"}
                                    </button>
                                    {keyStatus === "saved" && (
                                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                            Success
                                        </span>
                                    )}
                                    {keyStatus === "error" && (
                                        <span className="text-sm font-bold text-red-600">Failed to save key.</span>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Security */}
                        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">Data Protection</h2>
                            <p className="text-sm text-slate-600">
                                Enhanced security for your sensitive paperwork.
                            </p>

                            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-5">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900">
                                            Biometric lock (Recommended)
                                        </span>
                                        {biometricLock && (
                                            <span className="inline-flex items-center rounded-md bg-trust/10 px-2 py-0.5 text-[10px] font-bold text-trust ring-1 ring-inset ring-trust/20">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-md">
                                        Require Face ID, Touch ID, or Windows Hello to access the Evidence Wall and Documents sections.
                                    </p>
                                    {bioStatus === "saved" && (
                                        <p className="mt-1 text-xs font-bold text-emerald-600">Preference updated.</p>
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
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-4 focus-visible:ring-trust/10 ${biometricLock ? "bg-trust" : "bg-slate-300"}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out ${biometricLock ? "translate-x-5" : "translate-x-0.5"}`}
                                    />
                                </button>
                            </div>
                        </section>

                        {/* Account */}
                        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">Email Address</h2>
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                    Linked Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        disabled
                                        placeholder="user@example.com"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-400 cursor-not-allowed"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center text-slate-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-slate-400 ml-1 italic">
                                    Authentication is handled through your SSO provider and cannot be changed here.
                                </p>
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="space-y-4 rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-red-900 uppercase tracking-tight">Danger Zone</h2>
                            <p className="text-sm text-red-700 font-medium">Delete account and purge all case data from our systems.</p>

                            <button className="rounded-xl border-2 border-red-200 bg-white px-6 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all active:scale-95">
                                Delete Account
                            </button>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

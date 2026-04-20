"use client";

import { useEffect, useState } from "react";

type ProviderInfo = {
  provider: string;
  isActive: boolean;
  updatedAt: string;
  hasKey: boolean;
};

const PROVIDER_META: Record<string, { label: string; models: string; placeholder: string }> = {
  google: {
    label: "Google Gemini",
    models: "Gemini 2.5 Flash Lite, Gemini 2.0 Flash",
    placeholder: "AIza...",
  },
  openai: {
    label: "OpenAI",
    models: "GPT-4.1 Mini, GPT-4.1",
    placeholder: "sk-...",
  },
  openrouter: {
    label: "OpenRouter",
    models: "Claude 3.5 Sonnet, Llama 3.1 70B, Mixtral 8x7B",
    placeholder: "sk-or-...",
  },
};

export default function AiKeysPage() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<Record<string, { type: "success" | "error"; text: string }>>({});
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-keys")
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || `Error ${r.status}`);
        }
        return r.json();
      })
      .then((data: { providers?: ProviderInfo[] }) => {
        if (!data.providers) throw new Error("Malformated API response");
        setProviders(data.providers);
        setLoading(false);
      })
      .catch((err) => {
        setErrorStatus(err instanceof Error ? err.message : "Failed to load keys");
        setLoading(false);
      });
  }, []);

  async function saveKey(provider: string) {
    const apiKey = inputValues[provider]?.trim();
    if (!apiKey) return;

    setSavingProvider(provider);
    setMessage((prev) => ({ ...prev, [provider]: undefined as unknown as { type: "success" | "error"; text: string } }));

    try {
      const res = await fetch("/api/admin/ai-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (!res.ok) throw new Error("Failed");

      setProviders((prev) =>
        prev.map((p) => (p.provider === provider ? { ...p, hasKey: true, isActive: true } : p))
      );
      setInputValues((prev) => ({ ...prev, [provider]: "" }));
      setMessage((prev) => ({ ...prev, [provider]: { type: "success", text: "Key saved." } }));
    } catch {
      setMessage((prev) => ({ ...prev, [provider]: { type: "error", text: "Failed to save." } }));
    } finally {
      setSavingProvider(null);
      setTimeout(() => setMessage((prev) => ({ ...prev, [provider]: undefined as unknown as { type: "success" | "error"; text: string } })), 3000);
    }
  }

  async function removeKey(provider: string) {
    setSavingProvider(provider);
    try {
      await fetch("/api/admin/ai-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      setProviders((prev) =>
        prev.map((p) => (p.provider === provider ? { ...p, hasKey: false, isActive: false } : p))
      );
      setMessage((prev) => ({ ...prev, [provider]: { type: "success", text: "Key removed." } }));
    } catch {
      setMessage((prev) => ({ ...prev, [provider]: { type: "error", text: "Failed to remove." } }));
    } finally {
      setSavingProvider(null);
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust">Admin</p>
          <h1 className="text-2xl font-bold text-slate-900">AI Provider Keys</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium italic">Loading security configurations...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust">Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">AI Provider Keys</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Configure platform-level API keys for AI providers. These keys are used by the chat assistant.
          Keys are encrypted before storage.
        </p>
      </div>

      {errorStatus && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 animate-in fade-in slide-in-from-top-2">
          ⚠️ Error: {errorStatus}
        </div>
      )}

      {providers.length === 0 && !errorStatus && (
        <div className="rounded-2xl border border-trust-muted/10 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-400 italic">No AI providers discovered in the system.</p>
        </div>
      )}

      <div className="grid gap-6">
        {providers.map((prov) => {
          const meta = PROVIDER_META[prov.provider];
          if (!meta) return null;

          return (
            <div
              key={prov.provider}
              className="rounded-2xl border border-trust-muted/20 bg-white p-6 shadow-sm ring-1 ring-black/[0.01] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{meta.label}</h2>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-trust/60 mt-0.5">{meta.models}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                    prov.hasKey
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200/50"
                      : "bg-slate-50 text-slate-400 ring-slate-200/50"
                  }`}
                >
                  {prov.hasKey ? "Configured" : "Not set"}
                </span>
              </div>

              {prov.hasKey && (
                <div className="flex items-center justify-between rounded-xl border border-trust-muted/30 bg-trust-muted/5 px-4 py-3 my-4">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-trust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="text-sm text-trust font-bold">API key securely stored</span>
                  </div>
                  <button
                    onClick={() => removeKey(prov.provider)}
                    disabled={savingProvider === prov.provider}
                    className="text-xs font-bold text-red-600 hover:underline transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor={`key-${prov.provider}`} className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    {prov.hasKey ? "Replace existing key" : "Enter API Key"}
                  </label>
                  <input
                    id={`key-${prov.provider}`}
                    type="password"
                    value={inputValues[prov.provider] ?? ""}
                    onChange={(e) =>
                      setInputValues((prev) => ({ ...prev, [prov.provider]: e.target.value }))
                    }
                    placeholder={meta.placeholder}
                    className="w-full rounded-xl border border-trust-muted/30 bg-trust-muted/5 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-trust focus:outline-none focus:ring-4 focus:ring-trust/5 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => saveKey(prov.provider)}
                    disabled={!inputValues[prov.provider]?.trim() || savingProvider === prov.provider}
                    className="rounded-xl bg-trust px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 shadow-md shadow-trust/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {savingProvider === prov.provider ? "Saving..." : "Save Config"}
                  </button>
                  {message[prov.provider] && (
                    <span
                      className={`text-sm font-bold ${
                        message[prov.provider].type === "success" ? "text-trust" : "text-red-600"
                      } animate-in fade-in slide-in-from-left-2`}
                    >
                      {message[prov.provider].text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

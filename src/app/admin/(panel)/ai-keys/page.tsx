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

  useEffect(() => {
    fetch("/api/admin/ai-keys")
      .then((r) => r.json())
      .then((data: { providers: ProviderInfo[] }) => {
        setProviders(data.providers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-sand-900">AI Provider Keys</h1>
        <p className="text-sm text-slate-500">Loading...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sand-900">AI Provider Keys</h1>
        <p className="mt-1 text-sm text-sand-600">
          Configure platform-level API keys for AI providers. These keys are used by the chat assistant.
          Keys are encrypted before storage.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {providers.map((prov) => {
          const meta = PROVIDER_META[prov.provider];
          if (!meta) return null;

          return (
            <div
              key={prov.provider}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{meta.label}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{meta.models}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    prov.hasKey
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                      : "bg-slate-50 text-slate-500 ring-slate-500/10"
                  }`}
                >
                  {prov.hasKey ? "Configured" : "Not set"}
                </span>
              </div>

              {prov.hasKey && (
                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <span className="text-sm text-green-800 font-medium">API key configured</span>
                  <button
                    onClick={() => removeKey(prov.provider)}
                    disabled={savingProvider === prov.provider}
                    className="text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor={`key-${prov.provider}`} className="block text-xs text-slate-600 ml-1">
                  {prov.hasKey ? "Replace key" : "API Key"}
                </label>
                <input
                  id={`key-${prov.provider}`}
                  type="password"
                  value={inputValues[prov.provider] ?? ""}
                  onChange={(e) =>
                    setInputValues((prev) => ({ ...prev, [prov.provider]: e.target.value }))
                  }
                  placeholder={meta.placeholder}
                  className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => saveKey(prov.provider)}
                    disabled={!inputValues[prov.provider]?.trim() || savingProvider === prov.provider}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingProvider === prov.provider ? "Saving..." : "Save key"}
                  </button>
                  {message[prov.provider] && (
                    <span
                      className={`text-sm ${
                        message[prov.provider].type === "success" ? "text-green-600" : "text-red-600"
                      }`}
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

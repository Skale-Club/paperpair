"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPublicLabel, getPublicRoute, type CmsSlug, type EditablePage } from "@/lib/cms";

function findPage(pages: EditablePage[], slug: CmsSlug) {
  return pages.find((page) => page.slug === slug) ?? pages[0];
}

function hasDraftChanges(currentPage: EditablePage, publishedPage?: EditablePage) {
  if (!publishedPage) {
    return true;
  }

  return (
    currentPage.title !== publishedPage.title ||
    currentPage.content !== publishedPage.content
  );
}

export function AdminCmsEditor({ initialPages }: { initialPages: EditablePage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [publishedPages, setPublishedPages] = useState(initialPages);
  const [activeSlug, setActiveSlug] = useState<CmsSlug>(initialPages[0]?.slug ?? "home");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const activePage = findPage(pages, activeSlug);
  const publishedPage = findPage(publishedPages, activeSlug);
  const isDirty = activePage ? hasDraftChanges(activePage, publishedPage) : false;

  const updateField = (field: "title" | "content", value: string) => {
    setPages((prev) =>
      prev.map((page) => (page.slug === activeSlug ? { ...page, [field]: value } : page))
    );
    setStatus("Draft updated. Publish when ready.");
  };

  const publishPage = async () => {
    if (!activePage) {
      return;
    }

    setSaving(true);
    setStatus("Publishing...");

    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activePage)
    });

    if (!res.ok) {
      setSaving(false);
      setStatus("Failed to publish.");
      return;
    }

    setPublishedPages((prev) =>
      prev.map((page) => (page.slug === activePage.slug ? activePage : page))
    );
    setSaving(false);
    setStatus(`${getPublicLabel(activePage.slug)} published.`);
  };

  if (!activePage) {
    return <p className="text-sm text-slate-600">No page available to edit.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-trust-muted/20 bg-trust-muted/5 p-4 self-start">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-trust-muted/80 px-2">Site Sections</h2>
        <ul className="space-y-1.5">
          {pages.map((page) => {
            const isActive = page.slug === activeSlug;
            return (
              <li key={page.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSlug(page.slug);
                    setStatus("");
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-left transition-all group ${
                    isActive
                      ? "bg-white shadow-sm ring-1 ring-trust/20 text-trust shadow-trust/5"
                      : "text-slate-500 hover:bg-trust/5 hover:text-slate-700"
                  }`}
                >
                  <p className="text-sm font-bold">{getPublicLabel(page.slug)}</p>
                  <p className={`text-[10px] font-medium transition-colors ${isActive ? "text-trust/60" : "text-slate-400"}`}>
                    {getPublicRoute(page.slug)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="rounded-2xl border border-trust-muted/20 bg-white p-6 shadow-sm ring-1 ring-black/[0.01]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-trust-muted/10 pb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{getPublicLabel(activePage.slug)}</h3>
            <p className="text-sm text-slate-500 font-medium">
              Real-time draft editing for public-facing copy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200/50">
                <div className="h-1 w-1 rounded-full bg-amber-600 animate-pulse"></div>
                Unpublished Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200/50">
                <div className="h-1 w-1 rounded-full bg-emerald-600"></div>
                Synced Live
              </span>
            )}

            <Link
              href={getPublicRoute(activePage.slug)}
              className="rounded-xl border border-trust-muted/40 bg-white px-4 py-2 text-xs font-bold text-trust hover:bg-trust/5 transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview Live
            </Link>

            {isDirty && (
              <Button 
                type="button" 
                onClick={publishPage} 
                disabled={saving}
                className="rounded-xl bg-trust px-5 py-2 font-bold text-white hover:opacity-90 shadow-md shadow-trust/10 transition-all"
              >
                {saving ? "Publishing..." : "Publish Changes"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Meta Title</label>
              <Input
                value={activePage.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Page title"
                className="rounded-xl border-trust-muted/30 focus:border-trust ring-trust/5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Copy Content (Markdown supported)</label>
              <Textarea
                value={activePage.content}
                onChange={(e) => updateField("content", e.target.value)}
                rows={12}
                placeholder="Page content"
                className="rounded-xl border-trust-muted/30 focus:border-trust ring-trust/5 leading-relaxed text-sm"
              />
            </div>
            {status ? (
              <p className="rounded-lg bg-trust-muted/10 px-3 py-2 text-xs font-bold text-trust animate-in fade-in slide-in-from-top-1">
                {status}
              </p>
            ) : null}
          </div>

          <section className="rounded-2xl border border-trust-muted/10 bg-trust-muted/5 p-4 flex flex-col">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust-muted">Viewport Preview</p>
              </div>
              <span className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-slate-400 ring-1 ring-black/[0.03] shadow-sm">
                {getPublicRoute(activePage.slug)}
              </span>
            </div>

            <div className="flex-1 rounded-2xl border border-trust-muted/10 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-trust/40">
                {getPublicLabel(activePage.slug)}
              </p>
              <h4 className="mt-2 text-2xl font-bold text-slate-900 leading-tight">{activePage.title}</h4>
              <div className="mt-4 h-px w-12 bg-trust/20"></div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-slate-600 font-medium italic">
                {activePage.content}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

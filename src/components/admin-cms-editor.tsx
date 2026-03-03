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
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Pages</h2>
        <ul className="space-y-2">
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
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    isActive
                      ? "border-black bg-zinc-100 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{getPublicLabel(page.slug)}</p>
                  <p className="text-xs text-slate-500">{getPublicRoute(page.slug)}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{getPublicLabel(activePage.slug)}</h3>
            <p className="text-xs text-slate-500">
              Draft changes render in the preview immediately. Publish to push them live.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isDirty ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Draft changes
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Published
              </span>
            )}

            <Link
              href={getPublicRoute(activePage.slug)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open page
            </Link>

            {isDirty ? (
              <Button type="button" onClick={publishPage} disabled={saving}>
                {saving ? "Publishing..." : "Publish"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3">
            <Input
              value={activePage.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Page title"
            />
            <Textarea
              value={activePage.content}
              onChange={(e) => updateField("content", e.target.value)}
              rows={10}
              placeholder="Page content"
            />
            {status ? <p className="text-sm text-slate-600">{status}</p> : null}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Live Preview</p>
                <p className="text-xs text-slate-500">Updates while you type.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                {getPublicRoute(activePage.slug)}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {getPublicLabel(activePage.slug)}
              </p>
              <h4 className="mt-2 text-2xl font-semibold text-slate-900">{activePage.title}</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {activePage.content}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

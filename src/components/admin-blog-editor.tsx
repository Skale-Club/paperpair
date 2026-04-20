"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeBlogHandle } from "@/lib/cms";

type BlogItem = {
  id: string;
  handle: string;
  title: string;
  content: string;
  updatedAt: string | null;
};

function findPost(posts: BlogItem[], id: string) {
  return posts.find((post) => post.id === id) ?? posts[0];
}

function findPublishedVersion(posts: BlogItem[], currentPost: BlogItem) {
  return (
    posts.find((post) => post.id === currentPost.id) ??
    posts.find((post) => post.handle === currentPost.handle)
  );
}

function hasDraftChanges(currentPost: BlogItem, publishedPost?: BlogItem) {
  if (!publishedPost) {
    return true;
  }

  return (
    currentPost.handle !== publishedPost.handle ||
    currentPost.title !== publishedPost.title ||
    currentPost.content !== publishedPost.content
  );
}

export function AdminBlogEditor({ initialPosts }: { initialPosts: BlogItem[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [publishedPosts, setPublishedPosts] = useState(initialPosts);
  const [activeId, setActiveId] = useState(initialPosts[0]?.id ?? "draft-1");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const activePost = findPost(posts, activeId);
  const publishedPost = activePost ? findPublishedVersion(publishedPosts, activePost) : undefined;
  const isDirty = activePost ? hasDraftChanges(activePost, publishedPost) : false;

  const createDraft = () => {
    const draftNumber = posts.length + 1;
    const nextDraft: BlogItem = {
      id: `draft-${Date.now()}`,
      handle: `new-post-${draftNumber}`,
      title: "New blog post",
      content: "Write the body of the article here.",
      updatedAt: null
    };

    setPosts((prev) => [nextDraft, ...prev]);
    setActiveId(nextDraft.id);
    setStatus("New draft ready.");
  };

  const updateField = (field: "handle" | "title" | "content", value: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== activeId) {
          return post;
        }

        if (field === "handle") {
          if (publishedPost) {
            return post;
          }

          return { ...post, handle: normalizeBlogHandle(value) };
        }

        return { ...post, [field]: value };
      })
    );

    setStatus("Draft updated. Publish when ready.");
  };

  const publishPost = async () => {
    if (!activePost) {
      return;
    }

    setSaving(true);
    setStatus("Publishing...");

    const res = await fetch("/api/admin/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: activePost.handle || activePost.title,
        title: activePost.title,
        content: activePost.content
      })
    });

    if (!res.ok) {
      setSaving(false);
      setStatus("Failed to publish post.");
      return;
    }

    const data = (await res.json()) as { post: BlogItem };
    const nextPost = data.post;

    setPosts((prev) =>
      prev.map((post) => (post.id === activePost.id ? nextPost : post))
    );
    setPublishedPosts((prev) => {
      const existing = prev.find(
        (post) => post.id === nextPost.id || post.handle === nextPost.handle
      );

      if (!existing) {
        return [nextPost, ...prev];
      }

      return prev.map((post) =>
        post.id === existing.id || post.handle === existing.handle ? nextPost : post
      );
    });
    setActiveId(nextPost.id);
    setSaving(false);
    setStatus(`"${nextPost.title}" published.`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-trust-muted/20 bg-trust-muted/5 p-4 self-start">
        <div className="mb-6 px-2 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust-muted/80">Blog Articles</h2>
          </div>
          <Button 
            type="button" 
            onClick={createDraft} 
            size="sm"
            className="h-8 rounded-lg bg-trust px-3 text-[10px] font-bold uppercase tracking-wider text-white hover:opacity-90 shadow-sm shadow-trust/10"
          >
            New Draft
          </Button>
        </div>

        <ul className="space-y-1.5">
          {posts.length === 0 ? (
            <li className="rounded-xl border border-dashed border-trust-muted/30 bg-white/50 px-4 py-8 text-center text-xs font-medium text-slate-400 italic">
              No posts yet.
            </li>
          ) : (
            posts.map((post) => {
              const isActive = post.id === activeId;
              return (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(post.id);
                      setStatus("");
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left transition-all group ${
                      isActive
                        ? "bg-white shadow-sm ring-1 ring-trust/20 text-trust shadow-trust/5"
                        : "text-slate-500 hover:bg-trust/5 hover:text-slate-700"
                    }`}
                  >
                    <p className="truncate text-sm font-bold">{post.title}</p>
                    <p className={`truncate text-[10px] font-medium transition-colors ${isActive ? "text-trust/60" : "text-slate-400"}`}>
                      /{post.handle}
                    </p>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <div className="rounded-2xl border border-trust-muted/20 bg-white p-6 shadow-sm ring-1 ring-black/[0.01]">
        {activePost ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-trust-muted/10 pb-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Editor</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Drafts are private until they are published.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isDirty ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200/50">
                    <div className="h-1 w-1 rounded-full bg-amber-600 animate-pulse"></div>
                    Unsaved Draft
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200/50">
                    <div className="h-1 w-1 rounded-full bg-emerald-600"></div>
                    Live on Portal
                  </span>
                )}

                <Link
                  href="/blogs"
                  className="rounded-xl border border-trust-muted/40 bg-white px-4 py-2 text-xs font-bold text-trust hover:bg-trust/5 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Blog
                </Link>

                {isDirty && (
                  <Button 
                    type="button" 
                    onClick={publishPost} 
                    disabled={saving}
                    className="rounded-xl bg-trust px-5 py-2 font-bold text-white hover:opacity-90 shadow-md shadow-trust/10 transition-all"
                  >
                    {saving ? "Publishing..." : "Publish Post"}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="blog-handle" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    URL Slug
                  </label>
                  <Input
                    id="blog-handle"
                    value={activePost.handle}
                    onChange={(e) => updateField("handle", e.target.value)}
                    placeholder="uscis-update-checklist"
                    disabled={Boolean(publishedPost)}
                    className="rounded-xl border-trust-muted/30 focus:border-trust ring-trust/5 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  {publishedPost ? (
                    <p className="text-[10px] text-slate-400 font-medium ml-1">
                      Slugs are locked after publish to maintain SEO stability.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="blog-title" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Lead Title
                  </label>
                  <Input
                    id="blog-title"
                    value={activePost.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Blog title"
                    className="rounded-xl border-trust-muted/30 focus:border-trust ring-trust/5 text-lg font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="blog-content" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Article Body
                  </label>
                  <Textarea
                    id="blog-content"
                    value={activePost.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    rows={15}
                    placeholder="Write the article content"
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
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trust-muted">Blog Preview</p>
                  </div>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-slate-400 ring-1 ring-black/[0.03] shadow-sm">
                    /blogs/{activePost.handle}
                  </span>
                </div>

                <div className="flex-1 rounded-2xl border border-trust-muted/10 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-trust/40">
                    PAPERPAIR INSIGHTS
                  </p>
                  <h4 className="mt-2 text-2xl font-bold text-slate-900 leading-tight">{activePost.title}</h4>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-0.5 w-8 bg-trust/20"></div>
                    <p className="text-[10px] font-bold text-trust uppercase tracking-wider">
                      Draft Preview
                    </p>
                  </div>
                  <p className="mt-6 whitespace-pre-wrap text-sm leading-8 text-slate-600 font-medium">
                    {activePost.content}
                  </p>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-trust-muted/20 bg-trust-muted/5 py-20 text-center">
            <div className="mb-4 rounded-full bg-trust/10 p-4 text-trust">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Select an article to edit</h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">Capture your thoughts or create a new draft to begin.</p>
            <Button onClick={createDraft} className="mt-6 rounded-xl bg-trust px-6 font-bold text-white shadow-lg shadow-trust/20">
              Create First Draft
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

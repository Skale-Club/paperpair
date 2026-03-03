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
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Blog Posts</h2>
            <p className="text-xs text-slate-500">Published posts only appear on `/blogs`.</p>
          </div>
          <Button type="button" onClick={createDraft} className="px-3 py-2 text-xs">
            New Post
          </Button>
        </div>

        <ul className="space-y-2">
          {posts.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500">
              No posts yet. Create the first draft.
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
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-black bg-zinc-100 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <p className="truncate text-sm font-semibold">{post.title}</p>
                    <p className="truncate text-xs text-slate-500">/{post.handle}</p>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {activePost ? (
          <>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Blog Publisher</h3>
                <p className="text-xs text-slate-500">
                  Draft changes stay local until you publish this post.
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
                  href="/blogs"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open blogs
                </Link>

                {isDirty ? (
                  <Button type="button" onClick={publishPost} disabled={saving}>
                    {saving ? "Publishing..." : "Publish Post"}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="blog-handle" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Post handle
                  </label>
                  <Input
                    id="blog-handle"
                    value={activePost.handle}
                    onChange={(e) => updateField("handle", e.target.value)}
                    placeholder="uscis-update-checklist"
                    disabled={Boolean(publishedPost)}
                  />
                  {publishedPost ? (
                    <p className="text-xs text-slate-500">
                      The handle stays fixed after first publish so existing links remain stable.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label htmlFor="blog-title" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Title
                  </label>
                  <Input
                    id="blog-title"
                    value={activePost.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Blog title"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="blog-content" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Content
                  </label>
                  <Textarea
                    id="blog-content"
                    value={activePost.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    rows={12}
                    placeholder="Write the article content"
                  />
                </div>

                {status ? <p className="text-sm text-slate-600">{status}</p> : null}
              </div>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Live Preview</p>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    /blogs
                  </p>
                  <h4 className="mt-2 text-2xl font-semibold text-slate-900">{activePost.title}</h4>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-sky-700">
                    /{activePost.handle}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {activePost.content}
                  </p>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
            Create a draft to start writing.
          </div>
        )}
      </div>
    </div>
  );
}

export const BLOG_PAGE_SLUG = "blogs";
export const BLOG_POST_PREFIX = "blog:";

export const defaultPages = {
  home: {
    title: "Immigration made clear",
    content:
      "We guide your marriage-based Adjustment of Status with an AI-led experience and human support."
  },
  contato: {
    title: "Need support?",
    content: "Talk with our team about technical questions or documentation."
  },
  blogs: {
    title: "PaperPair Updates",
    content:
      "News, filing updates, and practical walkthroughs from the PaperPair team."
  }
} as const;

export type CmsSlug = keyof typeof defaultPages;
export type EditablePage = {
  slug: CmsSlug;
  title: string;
  content: string;
};

export function getPublicRoute(slug: CmsSlug) {
  if (slug === "home") return "/home";
  if (slug === "contato") return "/contact";
  return "/blogs";
}

export function getPublicLabel(slug: CmsSlug) {
  if (slug === "home") return "Home";
  if (slug === "contato") return "Contact";
  return "Blogs";
}

export function normalizeBlogHandle(input: string) {
  const withoutPrefix = input.replace(new RegExp(`^${BLOG_POST_PREFIX}`), "");
  const normalized = withoutPrefix
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "untitled-post";
}

export function toBlogSlug(handle: string) {
  return `${BLOG_POST_PREFIX}${normalizeBlogHandle(handle)}`;
}

export function fromBlogSlug(slug: string) {
  return normalizeBlogHandle(slug.replace(new RegExp(`^${BLOG_POST_PREFIX}`), ""));
}

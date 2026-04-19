import { unstable_cache } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { BLOG_POST_PREFIX, defaultPages, type EditablePage } from "@/lib/cms";

type TemplateMeta = {
  mapping?: Array<{ userField: string; pdfField: string; note?: string }>;
  edition?: string;
  category?: "template" | "checklist";
  mandatory?: boolean;
  updatedAt: string;
};

async function loadTemplateMeta(key: string): Promise<TemplateMeta | undefined> {
  const metaPath = path.join(process.cwd(), "public", "uploads", `${key}.meta.json`);

  try {
    const raw = await readFile(metaPath, "utf8");
    return JSON.parse(raw) as TemplateMeta;
  } catch {
    return undefined;
  }
}

export const getAdminUsersWithCaseSteps = unstable_cache(
  async () => {
    try {
      return await prisma.userProfile.findMany({
        where: { role: "USER" },
        include: { caseSteps: true },
        orderBy: { createdAt: "desc" }
      });
    } catch {
      return [];
    }
  },
  ["admin-users-with-case-steps"],
  {
    revalidate: 30,
    tags: ["admin-users"]
  }
);

export const getAdminDocumentTemplates = unstable_cache(
  async () => {
    try {
      const docs = await prisma.documentTemplate.findMany({
        orderBy: { updatedAt: "desc" }
      });

      return Promise.all(
        docs.map(async (doc) => ({
          ...doc,
          meta: await loadTemplateMeta(doc.key)
        }))
      );
    } catch {
      return [];
    }
  },
  ["admin-document-templates"],
  {
    revalidate: 30,
    tags: ["admin-documents"]
  }
);

export const getAdminCmsPages = unstable_cache(
  async (): Promise<EditablePage[]> => {
    try {
      const [home, contato, blogs] = await Promise.all([
        prisma.pageContent.findUnique({ where: { slug: "home" } }),
        prisma.pageContent.findUnique({ where: { slug: "contato" } }),
        prisma.pageContent.findUnique({ where: { slug: "blogs" } })
      ]);

      return [
        home
          ? { slug: "home", title: home.title, content: home.content }
          : { slug: "home", ...defaultPages.home },
        contato
          ? { slug: "contato", title: contato.title, content: contato.content }
          : { slug: "contato", ...defaultPages.contato },
        blogs
          ? { slug: "blogs", title: blogs.title, content: blogs.content }
          : { slug: "blogs", ...defaultPages.blogs }
      ];
    } catch {
      return [
        { slug: "home", ...defaultPages.home },
        { slug: "contato", ...defaultPages.contato },
        { slug: "blogs", ...defaultPages.blogs }
      ];
    }
  },
  ["admin-cms-pages"],
  {
    revalidate: 30,
    tags: ["admin-cms"]
  }
);

export const getAdminBlogPosts = unstable_cache(
  async () => {
    try {
      return await prisma.pageContent.findMany({
        where: {
          slug: {
            startsWith: BLOG_POST_PREFIX
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      });
    } catch {
      return [];
    }
  },
  ["admin-blog-posts"],
  {
    revalidate: 30,
    tags: ["admin-blogs"]
  }
);

export const getAdminAuditLogs = unstable_cache(
  async () => {
    try {
      const [steps, templates] = await Promise.all([
        prisma.caseStep.findMany({
          include: {
            userProfile: true
          },
          orderBy: { updatedAt: "desc" },
          take: 25
        }),
        prisma.documentTemplate.findMany({
          orderBy: { updatedAt: "desc" },
          take: 15
        })
      ]);

      return [
        ...steps.map((step) => ({
          id: `step-${step.id}`,
          at: step.updatedAt,
          actor: step.userProfile?.fullName || "User",
          scope: "case" as const,
          message: `Case step "${step.stepSlug}" marked ${step.status.toLowerCase()}.`
        })),
        ...templates.map((doc) => ({
          id: `doc-${doc.id}`,
          at: doc.updatedAt,
          actor: "Admin",
          scope: "template" as const,
          message: `Template ${doc.key} updated (${doc.name}).`
        }))
      ].sort((a, b) => b.at.getTime() - a.at.getTime());
    } catch {
      return [];
    }
  },
  ["admin-audit-logs"],
  {
    revalidate: 15,
    tags: ["admin-audit", "admin-documents"]
  }
);

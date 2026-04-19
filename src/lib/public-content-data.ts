import { unstable_cache } from "next/cache";
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { prisma } from "@/lib/prisma";
import { BLOG_POST_PREFIX, defaultPages } from "@/lib/cms";

type RawGuide = {
  filename: string;
  title: string;
  content: string;
};

type Step = {
  title: string;
  tasks: string[];
};

type QuickLink = {
  label: string;
  url: string;
};

export type ParsedGuide = {
  filename: string;
  title: string;
  summary: string;
  criticalPoints: string[];
  nextSteps: string[];
  steps: Step[];
  links: QuickLink[];
  preview: string[];
};

function cleanLine(text: string) {
  return text
    .replace(/^\-\s*\[[ xX]\]\s*/, "")
    .replace(/^\-\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/`/g, "")
    .trim();
}

function parseGuide(guide: RawGuide): ParsedGuide {
  const lines = guide.content.split(/\r?\n/).map((line) => line.trimEnd());

  const summary =
    lines
      .find((line) => line.startsWith("> "))
      ?.replace(/^>\s*/, "")
      .trim() ?? "Educational guide to support the process with safety and organization.";

  const criticalPoints: string[] = [];
  const nextSteps: string[] = [];
  const steps: Step[] = [];
  const links: QuickLink[] = [];

  const criticalStart = lines.findIndex((line) =>
    /^##\s+(Aspectos Mais Importantes|Most Important Points)/i.test(line)
  );
  if (criticalStart !== -1) {
    for (let index = criticalStart + 1; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line) continue;
      if (/^###\s+(Proximos passos recomendados|Recommended next steps)/i.test(line) || /^##\s+/i.test(line)) {
        break;
      }
      if (/^\-\s+/.test(line)) {
        criticalPoints.push(cleanLine(line));
      }
    }
  }

  const nextStepsStart = lines.findIndex((line) =>
    /^###\s+(Proximos passos recomendados|Recommended next steps)/i.test(line)
  );
  if (nextStepsStart !== -1) {
    for (let index = nextStepsStart + 1; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line) continue;
      if (/^##\s+/i.test(line) || /^###\s+(Passo\s+|Step\s+)/i.test(line)) {
        break;
      }
      if (/^\d+\.\s+/.test(line)) {
        nextSteps.push(cleanLine(line));
      }
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const stepMatch = line.match(/^###\s+((Passo|Step)\s+\d+\:\s*.+)$/i);
    if (!stepMatch) continue;

    const step: Step = {
      title: stepMatch[1].trim(),
      tasks: []
    };

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const taskLine = lines[cursor].trim();
      if (!taskLine) continue;
      if (/^##\s+/i.test(taskLine) || /^###\s+/i.test(taskLine)) {
        break;
      }
      if (/^\-\s+/.test(taskLine)) {
        step.tasks.push(cleanLine(taskLine));
      }
    }

    if (step.tasks.length) {
      steps.push(step);
    }
  }

  const resourcesStart = lines.findIndex((line) => /^##\s+RESOURCES/i.test(line));
  if (resourcesStart !== -1) {
    for (let index = resourcesStart + 1; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line) continue;
      if (/^##\s+/i.test(line) && !/^##\s+RESOURCES/i.test(line)) {
        break;
      }
      const linkMatch = line.match(/^\-\s*(.+?)\:\s*(https?:\/\/\S+)$/i);
      if (linkMatch) {
        links.push({
          label: linkMatch[1].trim(),
          url: linkMatch[2].trim()
        });
      }
    }
  }

  const preview = lines
    .filter(
      (line) =>
        !!line &&
        !line.startsWith("#") &&
        !line.startsWith(">") &&
        !line.startsWith("-") &&
        !line.startsWith("```")
    )
    .slice(0, 2);

  return {
    filename: guide.filename,
    title: guide.title,
    summary,
    criticalPoints,
    nextSteps,
    steps,
    links,
    preview
  };
}

export const getPublicCmsPages = unstable_cache(
  async () => {
    try {
      const [home, contato, blogs] = await Promise.all([
        prisma.pageContent.findUnique({ where: { slug: "home" } }),
        prisma.pageContent.findUnique({ where: { slug: "contato" } }),
        prisma.pageContent.findUnique({ where: { slug: "blogs" } })
      ]);

      return {
        home: home ?? { slug: "home", ...defaultPages.home },
        contato: contato ?? { slug: "contato", ...defaultPages.contato },
        blogs: blogs ?? { slug: "blogs", ...defaultPages.blogs }
      };
    } catch {
      return {
        home: { slug: "home", ...defaultPages.home },
        contato: { slug: "contato", ...defaultPages.contato },
        blogs: { slug: "blogs", ...defaultPages.blogs }
      };
    }
  },
  ["public-cms-pages"],
  {
    revalidate: 60,
    tags: ["public-cms"]
  }
);

export const getPublicBlogPosts = unstable_cache(
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
  ["public-blog-posts"],
  {
    revalidate: 60,
    tags: ["public-blogs"]
  }
);

export const getParsedGuides = unstable_cache(
  async () => {
    const guidesDir = path.join(process.cwd(), "src/content/guides");

    try {
      const files = (await readdir(guidesDir))
        .filter((file) => file.endsWith(".md"))
        .sort();

      const guides = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(guidesDir, filename);
          const content = await readFile(filePath, "utf8");
          const firstHeading = content
            .split("\n")
            .find((line) => line.startsWith("# "))
            ?.replace(/^# /, "")
            .trim();

          return {
            filename,
            title: firstHeading || filename,
            content
          };
        })
      );

      return guides.map((guide) => parseGuide(guide));
    } catch {
      return [];
    }
  },
  ["public-guides"],
  {
    revalidate: 300,
    tags: ["public-guides"]
  }
);

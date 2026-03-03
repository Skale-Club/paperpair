export const dynamic = "force-dynamic";

import { ChatUI } from "@/components/chat-ui";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  template?: string | string[];
};

function parseSelectedTemplateKeys(templateParam: SearchParams["template"]) {
  const raw = Array.isArray(templateParam) ? templateParam : templateParam ? [templateParam] : [];
  return Array.from(new Set(raw.map((value) => value.trim()).filter(Boolean)));
}

export default async function DocumentationFillingPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  let templates: Awaited<ReturnType<typeof prisma.documentTemplate.findMany>>;
  try {
    templates = await prisma.documentTemplate.findMany({
      orderBy: { updatedAt: "desc" }
    });
  } catch {
    templates = [];
  }
  const initialSelectedTemplateKeys = parseSelectedTemplateKeys(searchParams.template);

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black">
          Adjustment of Status
        </p>
        <h1 className="text-3xl font-semibold text-black">Documentation Filling</h1>
        <p className="max-w-3xl text-zinc-800">
          View the official template, answer the assistant in the bottom-right corner, and generate an automatically filled PDF with the collected data.
        </p>
      </div>

      <ChatUI
        templates={templates}
        initialSelectedTemplateKeys={initialSelectedTemplateKeys}
      />
    </section>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  template?: string | string[];
};

type Template = {
  id: string;
  key: string;
  name: string;
};

function parseSelectedTemplateKeys(templateParam: SearchParams["template"]) {
  const raw = Array.isArray(templateParam) ? templateParam : templateParam ? [templateParam] : [];
  return Array.from(new Set(raw.map((value) => value.trim()).filter(Boolean)));
}

export default async function SelectTemplatesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  let templates: Template[];
  try {
    templates = await prisma.documentTemplate.findMany({
      select: {
        id: true,
        key: true,
        name: true
      },
      orderBy: { updatedAt: "desc" }
    });
  } catch {
    templates = [];
  }

  const selectedFromQuery = parseSelectedTemplateKeys(resolved.template);
  const availableKeys = new Set(templates.map((template) => template.key));
  const selectedKeys = selectedFromQuery.filter((key) => availableKeys.has(key));

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black">
          Documentation Filling
        </p>
        <h1 className="text-3xl font-semibold text-black">Select templates</h1>
        <p className="max-w-3xl text-zinc-800">
          Choose one or more templates to open in the filling flow.
        </p>
      </div>

      <form
        action="/documentation-filling"
        method="get"
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div className="space-y-2">
          {templates.map((template) => (
            <label
              key={template.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3"
            >
              <input
                type="checkbox"
                name="template"
                value={template.key}
                defaultChecked={selectedKeys.includes(template.key)}
              />
              <span className="font-medium text-slate-900">{template.key}</span>
              <span className="text-slate-600">{template.name}</span>
            </label>
          ))}
          {!templates.length ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No templates available right now.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!templates.length}
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to filling
          </button>
          <Link
            href="/documentation-filling"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

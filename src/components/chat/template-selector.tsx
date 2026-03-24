"use client";

import { Button } from "@/components/ui/button";
import type { Template } from "./types";

type TemplateSelectorProps = {
  templates: Template[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
  onSelectAll: () => void;
  onGenerate: () => void;
  isLoading: boolean;
};

export function TemplateSelector({
  templates,
  selectedKeys,
  onToggle,
  onSelectAll,
  onGenerate,
  isLoading
}: TemplateSelectorProps) {
  const hasSelection = selectedKeys.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-black">Packet documents</h2>
        <button
          className="text-xs font-semibold text-black underline"
          onClick={onSelectAll}
          type="button"
        >
          Select all (Concurrent Filing)
        </button>
      </div>

      <div className="space-y-2">
        {templates.map((template) => {
          const checked = selectedKeys.includes(template.key);
          return (
            <label
              key={template.id}
              className="flex items-center gap-2 rounded border border-slate-200 px-2 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(template.key)}
              />
              <span className="font-medium text-slate-800">{template.key}</span>
              <span className="text-slate-600">{template.name}</span>
            </label>
          );
        })}
        {templates.length === 0 && (
          <p className="text-sm text-slate-600">
            No templates registered yet. Add them in the admin to enable filling.
          </p>
        )}
      </div>

      <Button
        className="mt-3 w-full bg-black text-white hover:bg-zinc-800"
        disabled={isLoading || !hasSelection}
        onClick={onGenerate}
        type="button"
      >
        Generate PDFs for selected documents
      </Button>
    </div>
  );
}

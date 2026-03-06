import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">My Case</p>
        <h1 className="text-2xl font-bold text-slate-900">Immigration Timeline</h1>
        <p className="text-sm text-slate-600">
          Follow each phase to prepare and submit your filing packet.
        </p>
      </div>
      {children}
    </div>
  );
}


"use client";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-trust-muted/20 bg-white p-5 shadow-sm"
        >
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="mt-2 h-9 w-20" />
        </div>
      ))}
    </div>
  );
}

export function StuckUsersSkeleton() {
  return (
    <div className="rounded-2xl border border-trust-muted/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-4 w-52" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-trust-muted/10 last:border-0">
            <div className="space-y-1.5">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-44" />
            </div>
            <SkeletonBlock className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-trust-muted/20 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-trust-muted/20">
        <SkeletonBlock className="h-5 w-32" />
      </div>
      <div className="divide-y divide-trust-muted/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-5">
            <SkeletonBlock className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-1/4" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

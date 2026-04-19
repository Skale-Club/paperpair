function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export function AdminRouteLoadingShell() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-10 w-72 max-w-full" />
        <SkeletonBlock className="h-4 w-[28rem] max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-4 h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SkeletonBlock className="h-5 w-44" />
          <SkeletonBlock className="mt-2 h-4 w-64 max-w-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-14 w-full" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SkeletonBlock className="h-5 w-28" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-11 w-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardRouteLoadingShell() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-9 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-4 h-8 w-16" />
            <SkeletonBlock className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-2 h-4 w-64 max-w-full" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="mt-2 h-4 w-56 max-w-full" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((__, innerIndex) => (
                  <SkeletonBlock key={innerIndex} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicRouteLoadingShell() {
  return (
    <section className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="mt-4 h-12 w-80 max-w-full" />
        <SkeletonBlock className="mt-4 h-5 w-[36rem] max-w-full" />
        <SkeletonBlock className="mt-2 h-5 w-[28rem] max-w-full" />
        <div className="mt-6 flex gap-3">
          <SkeletonBlock className="h-11 w-48" />
          <SkeletonBlock className="h-11 w-40" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="h-6 w-20" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-5/6" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <SkeletonBlock className="h-7 w-48" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((__, innerIndex) => (
                <SkeletonBlock key={innerIndex} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

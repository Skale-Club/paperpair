import { getParsedGuides } from "@/lib/public-content-data";

export default async function GuidePage() {
  const parsedGuides = await getParsedGuides();
  const featuredGuide =
    parsedGuides.find((guide) => guide.filename.includes("guia-passo-a-passo")) ??
    parsedGuides.find((guide) => guide.steps.length > 0) ??
    parsedGuides[0];
  const secondaryGuides = parsedGuides.filter((guide) => guide.filename !== featuredGuide?.filename);

  const badges = ["Critical", "Urgent", "Advantage"];
  const badgeColors = [
    "bg-zinc-900 text-white",
    "bg-zinc-700 text-zinc-100",
    "bg-zinc-600 text-zinc-100"
  ];
  const stepIcons = ["🗂️", "🩺", "📝", "📎", "📄", "💳", "💼", "✈️", "📦", "✅"];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-300 bg-zinc-100 px-5 py-6 md:px-10 md:py-10">
      <div className="pointer-events-none absolute -left-20 top-[-70px] h-72 w-72 rounded-full bg-zinc-300/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-[-90px] h-80 w-80 rounded-full bg-zinc-200/60 blur-3xl" />

      {!featuredGuide ? (
        <p className="relative text-sm text-slate-700">No guides loaded yet.</p>
      ) : (
        <div className="relative space-y-8">
          <header className="grid gap-6 border-b border-zinc-300 pb-7 md:grid-cols-[180px_1fr] md:items-center">
            <div className="mx-auto md:mx-0">
              <div className="relative h-36 w-36">
                <div className="absolute inset-0 rounded-full bg-zinc-300" />
                <div className="absolute left-1 top-2 h-20 w-28 rounded-2xl bg-zinc-500" />
                <div className="absolute right-2 top-14 h-16 w-20 rounded-2xl bg-zinc-400" />
                <span className="absolute left-[46px] top-[44px] text-lg text-white">•••</span>
              </div>
            </div>

            <div className="space-y-3">
              <h1
                className="text-4xl font-semibold tracking-tight text-black md:text-5xl"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Guides for Couples
              </h1>
              <p
                className="max-w-4xl text-lg leading-8 text-zinc-700"
                style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}
              >
                {featuredGuide.summary}
              </p>
            </div>
          </header>

          {featuredGuide.criticalPoints.length ? (
            <section className="grid gap-3 md:grid-cols-3">
              {featuredGuide.criticalPoints.slice(0, 3).map((point, index) => (
                <article key={point} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                      badgeColors[index % badgeColors.length]
                    }`}
                  >
                    {badges[index] ?? "Note"}
                  </span>
                  <p className="mt-3 text-sm leading-6 text-zinc-700">{point}</p>
                </article>
              ))}
            </section>
          ) : null}

          {featuredGuide.nextSteps.length ? (
            <section className="rounded-2xl border border-zinc-300 bg-zinc-50 p-5">
              <h2
                className="text-2xl font-semibold text-black"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Next Steps (4 Weeks)
              </h2>
              <ol className="mt-4 grid gap-3 md:grid-cols-2">
                {featuredGuide.nextSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3 rounded-xl bg-white px-3 py-3 text-sm text-zinc-700">
                    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-semibold text-zinc-800">
                      ✓
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {featuredGuide.steps.length ? (
            <section className="space-y-6">
              {featuredGuide.steps.map((step, index) => (
                <article
                  key={step.title}
                  className="relative rounded-3xl border border-zinc-300 bg-white/90 px-4 py-5 shadow-sm md:px-6"
                >
                  {index < featuredGuide.steps.length - 1 ? (
                    <span className="absolute left-10 top-full hidden h-7 w-[3px] bg-zinc-300 md:block" />
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-[84px_1fr] md:items-start">
                    <div className="mx-auto h-20 w-20 rounded-full bg-zinc-200 ring-4 ring-zinc-100 md:mx-0">
                      <span className="flex h-full items-center justify-center text-3xl">
                        {stepIcons[index % stepIcons.length]}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-2xl bg-black px-4 py-2 text-xl font-semibold text-white">
                          Step {index + 1}
                        </span>
                        <h3
                          className="text-[1.65rem] font-semibold text-black"
                          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                        >
                          {step.title.replace(/^(Passo|Step)\s+\d+\:\s*/i, "")}
                        </h3>
                      </div>

                      <ul className="grid gap-3 md:grid-cols-2">
                        {step.tasks.slice(0, 6).map((task) => (
                          <li key={task} className="flex items-start gap-3 rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                            <span className="mt-[1px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs text-zinc-800">
                              ●
                            </span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>

                      {step.tasks.length > 6 ? (
                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-600">
                          +{step.tasks.length - 6} items in this step
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : null}

          {featuredGuide.links.length ? (
            <section className="rounded-2xl border border-zinc-300 bg-white/80 p-5">
              <h2
                className="text-2xl font-semibold text-black"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Official Resources
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {featuredGuide.links.slice(0, 8).map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 transition hover:border-black hover:bg-white"
                  >
                    <p className="font-medium">{link.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-zinc-500 group-hover:text-black">
                      Open official source
                    </p>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {secondaryGuides.length ? (
            <section className="rounded-2xl border border-zinc-300 bg-white/80 p-5">
              <h2
                className="text-2xl font-semibold text-black"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Other Guides
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {secondaryGuides.map((guide) => (
                  <article key={guide.filename} className="rounded-xl border border-zinc-300 bg-zinc-50 p-4">
                    <h3 className="text-lg font-semibold text-black">{guide.title}</h3>
                    <div className="mt-2 space-y-1 text-sm text-zinc-700">
                      {guide.preview.length ? (
                        guide.preview.map((line) => <p key={line}>{line}</p>)
                      ) : (
                        <p>Additional guide available on this page.</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}

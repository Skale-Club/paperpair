import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { defaultPages } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let page: { slug: string; title: string; content: string };
  try {
    page =
      (await prisma.pageContent.findUnique({ where: { slug: "home" } })) ?? {
        slug: "home",
        ...defaultPages.home
      };
  } catch {
    page = { slug: "home", ...defaultPages.home };
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-800 bg-emerald-950 px-5 py-6 text-white md:px-10 md:py-10">
      <div className="pointer-events-none absolute -left-20 top-[-70px] h-72 w-72 rounded-full bg-emerald-800/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-[-90px] h-80 w-80 rounded-full bg-emerald-700/50 blur-3xl" />

      <div className="relative space-y-8">
        <header className="grid gap-6 border-b border-emerald-800/60 pb-8 md:grid-cols-[180px_1fr] md:items-center">
          <div className="mx-auto md:mx-0">
            <div className="relative h-36 w-36 rounded-full bg-emerald-900/80 ring-2 ring-emerald-700/60 shadow-lg shadow-emerald-900/40">
              <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
                <circle cx="48" cy="46" r="26" fill="#dbeafe" />
                <circle cx="78" cy="42" r="22" fill="#a5f3fc" />
                <path
                  fill="#0ea5e9"
                  d="M26 92c0-16 12-28 26-28h16c14 0 26 12 26 28v6H26z"
                />
                <path
                  fill="#0284c7"
                  d="M44 68c-6 4.5-10 12-10 22v8h52v-8c0-10-4-17.5-10-22H44z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">Adjustment of Status</p>
            <h1
              className="text-4xl font-semibold tracking-tight text-white md:text-5xl"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              {page.title}
            </h1>
            <p
              className="max-w-4xl text-lg leading-8 text-white/80"
              style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}
            >
              {page.content}
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/documentation-filling"
                className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Open Documentation Filling
              </Link>
              <Link
                href="/guide"
                className="inline-flex rounded-xl border border-white/40 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                View step-by-step guide
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm">
            <span className="inline-flex rounded-full bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Critical
            </span>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Do not travel without approved advance parole during adjustment.
            </p>
          </article>

          <article className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm">
            <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Urgent
            </span>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Financial sponsorship must be complete at initial filing.
            </p>
          </article>

          <article className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Advantage
            </span>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Step-by-step flow that reduces errors and rework.
            </p>
          </article>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/20 bg-white/5 p-5">
          <h2
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            How It Works
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/40 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Step 1</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Guided Intake</h3>
              <p className="mt-2 text-sm text-slate-700">
                The assistant gathers essential couple data with focused questions.
              </p>
            </div>

            <div className="rounded-xl border border-white/40 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Step 2</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Organization</h3>
              <p className="mt-2 text-sm text-slate-700">
                The system structures information and prepares fields for the forms.
              </p>
            </div>

            <div className="rounded-xl border border-white/40 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Step 3</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">PDF Generation</h3>
              <p className="mt-2 text-sm text-slate-700">
                Automatic fill of the official templates configured in the admin.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/30 bg-white p-5">
          <div>
            <h2
              className="text-2xl font-semibold text-slate-900"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Ready to get started?
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Jump into Documentation Filling or read the full guide before filing.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/documentation-filling"
              className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Open Documentation Filling
            </Link>
            <Link
              href="/guide"
              className="inline-flex rounded-xl border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Open guide
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

import Link from "next/link";

const FORMS = [
    {
        form: "I-130",
        title: "Petition for Alien Relative",
        desc: "Filed by the U.S. citizen spouse to establish the relationship.",
        href: "/dashboard/forms/i130",
        available: false,
    },
    {
        form: "I-485",
        title: "Adjustment of Status",
        desc: "Core application to become a lawful permanent resident.",
        href: "/dashboard/forms/i485",
        available: true,
    },
    {
        form: "I-765",
        title: "Employment Authorization",
        desc: "Allows you to work in the U.S. while your case is pending.",
        href: "/dashboard/forms/i765",
        available: false,
    },
    {
        form: "I-131",
        title: "Advance Parole",
        desc: "Allows you to travel outside the U.S. while your application is pending.",
        href: "/dashboard/forms/i131",
        available: false,
    },
];

export default function FormsPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">My Case</p>
                <h1 className="text-2xl font-bold text-slate-900">Forms</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Select a form to begin your guided intake. PaperPair will walk you through each question.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {FORMS.map((item) =>
                    item.available ? (
                        <Link
                            key={item.form}
                            href={item.href}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-base font-bold text-slate-900">{item.form}</p>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="mt-0.5 text-sm font-medium text-slate-600">{item.title}</p>
                            <p className="mt-2 text-xs text-slate-400">{item.desc}</p>
                        </Link>
                    ) : (
                        <div
                            key={item.form}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-base font-bold text-slate-400">{item.form}</p>
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                    Coming soon
                                </span>
                            </div>
                            <p className="mt-0.5 text-sm font-medium text-slate-400">{item.title}</p>
                            <p className="mt-2 text-xs text-slate-400">{item.desc}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

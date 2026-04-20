export default function SupportPage() {
    const categories = [
        {
            label: "CRITICAL",
            color: "bg-slate-900 text-white",
            tips: [
                {
                    title: "Do not travel without Advance Parole",
                    content:
                        "The beneficiary should not leave the U.S. during the process without valid travel authorization. An unapproved departure can abandon the adjustment and trigger severe immigration consequences.",
                },
                {
                    title: "Keep status valid",
                    content:
                        "If you entered with a visa, keep that status valid while the I-485 is pending. Working without an EAD or violating visa terms can jeopardize the case.",
                },
            ],
        },
        {
            label: "URGENT",
            color: "bg-slate-700 text-white",
            tips: [
                {
                    title: "Financial joint sponsor",
                    content:
                        "If the primary sponsor income is insufficient under the I-864P, a joint sponsor must show their own qualifying income for the applicable household size.",
                },
                {
                    title: "Schedule medical exam (I-693) early",
                    content:
                        "Book the exam with a USCIS-designated civil surgeon as soon as possible. The form is valid for two years—keep vaccines current to avoid delays.",
                },
            ],
        },
        {
            label: "ADVANTAGE",
            color: "bg-slate-500 text-white",
            tips: [
                {
                    title: "Immediate-relative spouse eligibility",
                    content:
                        "Many immediate-relative spouse cases have protections for adjustment of status, including scenarios with overstay after a lawful entry.",
                },
                {
                    title: "Concurrent filing saves time",
                    content:
                        "Filing I-130, I-485, I-765, and I-131 together can yield work and travel authorization while the green card is pending, cutting total wait time.",
                },
            ],
        },
    ];

    const nextSteps = [
        {
            title: "Weeks 1-2",
            items: [
                "Gather all personal documents (certificates, passports, I-94)",
                "Take USCIS-style photos (2x2 inches, white background)",
                "Schedule the medical exam with a civil surgeon",
            ],
        },
        {
            title: "Weeks 2-3",
            items: [
                "Complete forms I-130, I-485, I-765, and I-131",
                "Prepare the Affidavit of Support (I-864) with income evidence",
                "Collect bona fide marriage evidence",
            ],
        },
        {
            title: "Weeks 3-4",
            items: [
                "Review the full packet",
                "Send the complete package to USCIS",
                "Await receipt notice (I-797C)",
            ],
        },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">My Case</p>
                <h1 className="text-2xl font-bold text-slate-900">Support Guide</h1>
                <p className="mt-1 text-sm text-slate-600 truncate">
                    Educational, general guidance. Always confirm on USCIS.gov before filing.
                </p>
            </div>

            {/* Category Cards */}
            {categories.map((cat) => (
                <div key={cat.label}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {cat.tips.map((tip, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-slate-200 bg-white p-5"
                            >
                                <span
                                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider ${cat.color}`}
                                >
                                    {cat.label}
                                </span>
                                <h3 className="mt-3 text-sm font-bold text-slate-900">
                                    {tip.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {tip.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Next Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Next Steps (4 Weeks)
                </h2>
                <div className="space-y-6">
                    {nextSteps.map((step) => (
                        <div key={step.title}>
                            <h3 className="text-sm font-bold text-slate-800 mb-2">
                                {step.title}
                            </h3>
                            <ul className="space-y-1.5">
                                {step.items.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-slate-600"
                                    >
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

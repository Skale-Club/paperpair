"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ─── phase data ─── */
type PhaseSection = {
    id: string;
    label: string;
};

type Phase = {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    sections: PhaseSection[];
};

const PHASES: Phase[] = [
    {
        id: "get-ready",
        number: 1,
        title: "Get Ready",
        subtitle: "Eligibility & evidence",
        sections: [
            { id: "determine-eligibility", label: "Determine eligibility" },
            { id: "gather-documents", label: "Gather documents" },
            { id: "annotations", label: "Annotations" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        )
    },
    {
        id: "application",
        number: 2,
        title: "Application",
        subtitle: "Forms & medical exam",
        sections: [
            { id: "my-forms", label: "My forms" },
            { id: "what-to-expect", label: "What to expect" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        )
    },
    {
        id: "submission",
        number: 3,
        title: "Submission",
        subtitle: "Print, collate & mail",
        sections: [
            { id: "documentation-bundle", label: "Documentation bundle" },
            { id: "instructions", label: "Instructions" },
            { id: "mailing", label: "Mailing" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        )
    },
    {
        id: "finalizing",
        number: 4,
        title: "Finalizing",
        subtitle: "Interview preparation",
        sections: [
            { id: "interview-instructions", label: "Interview instructions" },
            { id: "next-steps", label: "Next Steps" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a1.994 1.994 0 0 1-1.414-.586m0 0L11 14h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4l.586-.586z" />
            </svg>
        )
    }
];

const STORAGE_KEY = "paperpair_timeline_complete";

/* ─── helpers ─── */
function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );
}

function Tip({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="shrink-0 mt-0.5">💡</span>
            <span>{children}</span>
        </div>
    );
}

function Warning({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span className="font-medium">{children}</span>
        </div>
    );
}

function DocItem({ label, desc }: { label: string; desc: string }) {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="mt-1 shrink-0 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
        </div>
    );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
            {children}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </Link>
    );
}

/* ─── section content ─── */

function SectionDetermineEligibility() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Determine eligibility</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 1: Get Ready — Determine eligibility, gather evidence, and build your foundation.</p>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
                <p>Before you begin, confirm you meet the basic requirements for a marriage-based green card:</p>
                <ul className="ml-4 list-disc space-y-1.5 text-slate-600">
                    <li>Your spouse is a U.S. citizen or lawful permanent resident</li>
                    <li>Your marriage is legally valid and bona fide</li>
                    <li>You entered the U.S. lawfully (or qualify for an exception)</li>
                    <li>You have no disqualifying criminal history or immigration violations</li>
                </ul>
            </div>
        </div>
    );
}

function SectionGatherDocuments() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Gather documents</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 1: Get Ready — Determine eligibility, gather evidence, and build your foundation.</p>
            </div>
            <Tip>Start building evidence of your genuine relationship now — it will be critical later.</Tip>
            <div className="space-y-2 mb-2">
                <DocItem label="Birth Certificate" desc="Original with English translation if in a foreign language." />
                <DocItem label="Valid Passport" desc="Must not expire within 6 months of filing." />
                <DocItem label="Marriage Certificate" desc="Original certified copy from the issuing authority." />
                <DocItem label="Passport-Style Photos" desc="Two 2x2 inch photos per USCIS specs." />
                <DocItem label="Government ID" desc="Driver's license, state ID, or national ID card." />
                <DocItem label="Divorce Decrees / Death Certificates" desc="Proof that prior marriages were legally terminated (if any)." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {[
                    { title: "Joint Bank Account", desc: "Open a shared checking or savings account and use it regularly." },
                    { title: "Shared Car Insurance", desc: "Add your spouse to your policy or combine under one." },
                    { title: "Shared Address", desc: "Ensure both names are on the lease, mortgage, or utility bills." },
                    { title: "Joint Tax Return", desc: "File taxes together as 'Married Filing Jointly' if possible." },
                    { title: "Shared Health Insurance", desc: "Add your spouse to your employer plan or vice versa." },
                    { title: "Beneficiary Designations", desc: "Name each other as beneficiaries on bank, 401k, or life insurance." }
                ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                    </div>
                ))}
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Ready to upload your documents?</p>
                <p className="text-sm text-indigo-700 mb-4">
                    Head to the Documents page to upload your personal files. You can return here anytime.
                </p>
                <ActionLink href="/dashboard/documents/gather">Go to Documents</ActionLink>
            </div>
        </div>
    );
}

function SectionAnnotations() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Annotations</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 1: Get Ready — Determine eligibility, gather evidence, and build your foundation.</p>
            </div>
            <Tip>
                Start gathering a photo album now! Collect dated photos of you and your spouse together — trips, holidays, family events.
                USCIS may ask for 10–20 photos spanning your relationship. Include timestamps and label who is in each photo.
            </Tip>
        </div>
    );
}

function SectionMyForms() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">My forms</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — Select your forms, prepare your documentation, and get your medical exam.</p>
            </div>
            <p className="text-sm text-slate-600">
                Head to the Forms page to select and begin filling out your required immigration forms.
                PaperPair will guide you through each one step by step.
            </p>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Go to the Forms page</p>
                <p className="text-sm text-indigo-700 mb-4">
                    Select your required forms and begin filling them in. Your uploaded documents can be used to auto-fill fields.
                </p>
                <ActionLink href="/dashboard/forms">Go to Forms</ActionLink>
            </div>
        </div>
    );
}

function SectionWhatToExpect() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">What to expect</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — Select your forms, prepare your documentation, and get your medical exam.</p>
            </div>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
                <p>Every applicant needs a medical exam (Form I-693) from a USCIS-designated Civil Surgeon.</p>
                <ul className="ml-4 list-disc space-y-1.5">
                    <li>Find a Civil Surgeon near you using the USCIS tool on your Dashboard</li>
                    <li>Bring your vaccination records and photo ID to the appointment</li>
                    <li>The doctor will provide a <strong>sealed envelope</strong> — do not open it</li>
                    <li>The I-693 is valid for 2 years from the date of the doctor&apos;s signature</li>
                </ul>
            </div>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
                <p>Before you move to submission, make sure you have:</p>
                <ul className="ml-4 list-disc space-y-1.5">
                    <li>All forms completed and signed</li>
                    <li>Two passport-style photos per applicant</li>
                    <li>Copies of all supporting documents (keep originals safe)</li>
                    <li>Payment (check or money order) for filing fees</li>
                </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        Beta
                    </span>
                    <p className="text-sm font-semibold text-slate-800">AI Auto-Fill (Coming Soon)</p>
                </div>
                <p className="text-sm text-slate-600">
                    Once your personal documents are uploaded, PaperPair can extract key data (names, dates, addresses)
                    using AI and automatically populate your government forms.
                </p>
            </div>
        </div>
    );
}

function SectionDocumentationBundle() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Documentation bundle</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 3: Submission — Download your completed forms, prepare the physical packet, and mail it.</p>
            </div>
            <p className="text-sm text-slate-600 mb-3">
                Once all forms are filled out, download the finalized PDFs and assemble your packet.
                Stack your documents in this exact order, top to bottom:
            </p>
            <ActionLink href="/dashboard/forms/i485">Download Completed Forms</ActionLink>
            <div className="space-y-1 mt-4">
                {[
                    { pos: 1, item: "Filing fee (check or money order)", note: "Placed on top, clipped to G-1145" },
                    { pos: 2, item: "Form G-1145", note: "E-notification of acceptance" },
                    { pos: 3, item: "Form I-130 (Petition for Alien Relative)", note: "With supporting evidence" },
                    { pos: 4, item: "Form I-130A (Supplemental Info)", note: "If applicable" },
                    { pos: 5, item: "Form I-485 (Adjustment of Status)", note: "With 2 passport photos" },
                    { pos: 6, item: "Form I-765 (Employment Authorization)", note: "With 2 passport photos" },
                    { pos: 7, item: "Form I-131 (Advance Parole)", note: "With 2 passport photos" },
                    { pos: 8, item: "Form I-693 (Medical Exam)", note: "Sealed envelope from Civil Surgeon" },
                    { pos: 9, item: "Form I-864 (Affidavit of Support)", note: "With tax returns & W-2s" },
                    { pos: 10, item: "Supporting Documents", note: "Birth certificates, marriage cert, bona fide evidence" }
                ].map((entry) => (
                    <div key={entry.pos} className="flex items-center gap-3 rounded-lg px-4 py-2.5 hover:bg-slate-50">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {entry.pos}
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{entry.item}</p>
                            <p className="text-xs text-slate-500">{entry.note}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SectionInstructions() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Instructions</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 3: Submission — Download your completed forms, prepare the physical packet, and mail it.</p>
            </div>
            <div className="space-y-3">
                <Warning>These rules are strictly enforced by USCIS. Violating them may result in your packet being returned.</Warning>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        { rule: "Print Single-Sided", desc: "All forms and documents must be printed on one side of 8.5\" × 11\" paper only." },
                        { rule: "Binder Clips ONLY", desc: "Never use staples! Use binder clips to hold each form section together." },
                        { rule: "Check or Money Order", desc: "Pay filing fees by personal check or money order payable to 'U.S. Department of Homeland Security'." },
                        { rule: "No Highlights or Marks", desc: "Do not highlight, circle, or mark on any government form." }
                    ].map((item) => (
                        <div key={item.rule} className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                            <p className="text-sm font-bold text-red-900">{item.rule}</p>
                            <p className="mt-1 text-xs text-red-700">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SectionMailing() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Mailing</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 3: Submission — Download your completed forms, prepare the physical packet, and mail it.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-2">USCIS Lockbox Facility</p>
                <p className="text-sm text-slate-600 mb-3">
                    For concurrent filing (I-130 + I-485 together), mail your packet to the appropriate USCIS lockbox.
                    The exact address depends on your state of residence — check USCIS.gov for the latest instructions.
                </p>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 font-mono">
                    USCIS Chicago Lockbox<br />
                    P.O. Box 805887<br />
                    Chicago, IL 60680-4120
                </div>
                <p className="mt-3 text-xs text-slate-500">
                    Use USPS Certified Mail with Return Receipt to get proof of delivery.
                </p>
            </div>
            <Tip>
                After USCIS receives your packet, your next milestone is the <strong>I-797C (Notice of Action)</strong> —
                this is your official receipt confirming your case has been accepted. You&apos;ll typically receive it 2–4 weeks after mailing.
            </Tip>
        </div>
    );
}

function SectionInterviewInstructions() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Interview instructions</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: Finalizing — Prepare for your interview and wrap up the process.</p>
            </div>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
                <p>
                    After USCIS processes your application, you&apos;ll be scheduled for an in-person interview at your local USCIS field office.
                    Both spouses must attend.
                </p>
                <ul className="ml-4 list-disc space-y-1.5">
                    <li>The officer will verify your identity and place you under oath</li>
                    <li>They&apos;ll review your application and ask questions about your relationship</li>
                    <li>They may ask you and your spouse questions separately</li>
                    <li>Bring originals of all submitted documents plus any new evidence</li>
                    <li>Typical duration: 15–30 minutes</li>
                </ul>
            </div>
            <div className="space-y-2">
                <DocItem label="Interview Notice (I-797C)" desc="The official notice scheduling your interview — do not forget this." />
                <DocItem label="Valid Passports" desc="Both spouses must bring current passports." />
                <DocItem label="Original Documents" desc="Birth certificates, marriage certificate, and all originals of submitted copies." />
                <DocItem label="New Bona Fide Evidence" desc="Recent bank statements, photos, travel records since filing." />
                <DocItem label="State Photo ID" desc="Driver's license or state ID for both spouses." />
            </div>
        </div>
    );
}

function SectionNextSteps() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Next Steps</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: Finalizing — Prepare for your interview and wrap up the process.</p>
            </div>
            <p className="text-sm text-slate-600 mb-4">
                For comprehensive interview practice — including common questions, flashcards, tips, and what-to-bring checklists —
                head to the dedicated Next Steps page.
            </p>
            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5">
                <p className="text-sm font-semibold text-teal-900 mb-2">Full Interview Preparation</p>
                <p className="text-sm text-teal-700 mb-4">
                    Practice questions, study guides, flashcards, and tips to help you feel confident on the big day.
                </p>
                <Link
                    href="/dashboard/interview"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                >
                    Go to Next Steps — Interview Prep
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}

/* ─── main component ─── */

const SECTION_CONTENT: Record<string, () => React.ReactNode> = {
    "determine-eligibility": SectionDetermineEligibility,
    "gather-documents": SectionGatherDocuments,
    "annotations": SectionAnnotations,
    "my-forms": SectionMyForms,
    "what-to-expect": SectionWhatToExpect,
    "documentation-bundle": SectionDocumentationBundle,
    "instructions": SectionInstructions,
    "mailing": SectionMailing,
    "interview-instructions": SectionInterviewInstructions,
    "next-steps": SectionNextSteps,
};

export function MyCaseTimeline() {
    const [activePhase, setActivePhase] = useState("get-ready");
    const [activeSection, setActiveSection] = useState<string>("determine-eligibility");
    const [completedPhases, setCompletedPhases] = useState<Record<string, boolean>>({});
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setCompletedPhases(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    const toggleComplete = (phaseId: string) => {
        setCompletedPhases((prev) => {
            const next = { ...prev, [phaseId]: !prev[phaseId] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const handlePhaseClick = (phaseId: string) => {
        const phase = PHASES.find(p => p.id === phaseId);
        setActivePhase(phaseId);
        setActiveSection(phase?.sections[0]?.id ?? "");
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSectionClick = (phaseId: string, sectionId: string) => {
        setActivePhase(phaseId);
        setActiveSection(sectionId);
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const ActiveContent = SECTION_CONTENT[activeSection];

    return (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            {/* ── Left: vertical phase nav ── */}
            <nav className="space-y-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Timeline</p>
                {PHASES.map((phase, i) => {
                    const active = activePhase === phase.id;
                    const done = !!completedPhases[phase.id];
                    const isLast = i === PHASES.length - 1;

                    return (
                        <div key={phase.id} className="relative">
                            {/* connector line */}
                            {!isLast && (
                                <div className={`absolute left-[19px] top-[48px] w-0.5 transition-all duration-300 ${active ? `h-[calc(100%_-_12px)]` : "h-[calc(100%_-_24px)]"} ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
                            )}

                            <button
                                onClick={() => handlePhaseClick(phase.id)}
                                className={`relative flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all ${active
                                        ? "bg-white shadow-sm ring-1 ring-slate-200"
                                        : "hover:bg-slate-50"
                                    }`}
                            >
                                {/* icon circle */}
                                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${done
                                        ? "bg-emerald-100 text-emerald-600"
                                        : active
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-500"
                                    }`}>
                                    {done ? <CheckIcon /> : phase.icon}
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${active ? "text-slate-900" : "text-slate-700"}`}>
                                            {phase.title}
                                        </span>
                                        {done && (
                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                Done
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{phase.subtitle}</p>
                                </div>
                            </button>

                            {/* subsections — shown when phase is active */}
                            {active && (
                                <div className="ml-5 mb-2 border-l-2 border-slate-200 pl-3 space-y-1.5">
                                    {phase.sections.map((section) => {
                                        const sectionActive = activeSection === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => handleSectionClick(phase.id, section.id)}
                                                className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition-colors ${sectionActive
                                                    ? "border-slate-300 bg-white font-semibold text-slate-900 shadow-sm"
                                                    : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-700"
                                                }`}
                                            >
                                                {section.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* ── Center: section content ── */}
            <div ref={contentRef} className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 overflow-y-auto">
                {ActiveContent && <ActiveContent />}

                {/* mark complete toggle */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                    <span className="text-sm text-slate-600">Mark this phase as complete</span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={!!completedPhases[activePhase]}
                        onClick={() => toggleComplete(activePhase)}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 ${completedPhases[activePhase] ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${completedPhases[activePhase] ? "translate-x-5" : "translate-x-0.5"
                            }`} />
                    </button>
                </div>
            </div>
        </div>
    );
}

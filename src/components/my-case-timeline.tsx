"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { SECTION_CHECKLISTS } from "@/lib/timeline-checklists";

/* ─── types ─── */
type PhaseSection = { id: string; label: string };
type Phase = {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    sections: PhaseSection[];
};

/* ─── phase / section data ─── */
const PHASES: Phase[] = [
    {
        id: "get-ready",
        number: 1,
        title: "Get Ready",
        subtitle: "Eligibility & evidence",
        sections: [
            { id: "determine-eligibility", label: "Determine eligibility" },
            { id: "gather-documents", label: "Gather documents" },
            { id: "relationship-evidence", label: "Relationship evidence" },
            { id: "medical-exam-prep", label: "Schedule medical exam" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        id: "application",
        number: 2,
        title: "Application",
        subtitle: "Forms & medical exam",
        sections: [
            { id: "medical-exam-complete", label: "Complete medical exam" },
            { id: "form-i130", label: "Form I-130" },
            { id: "form-i130a", label: "Form I-130A" },
            { id: "form-i485", label: "Form I-485" },
            { id: "form-i864", label: "Form I-864" },
            { id: "form-i765-i131", label: "Forms I-765 & I-131" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    },
    {
        id: "submission",
        number: 3,
        title: "Submission",
        subtitle: "Print, collate & mail",
        sections: [
            { id: "documentation-bundle", label: "Documentation bundle" },
            { id: "instructions", label: "Assembly rules" },
            { id: "mailing", label: "Mailing" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        ),
    },
    {
        id: "after-filing",
        number: 4,
        title: "After Filing",
        subtitle: "Notices, biometrics & interview",
        sections: [
            { id: "track-notices", label: "Track notices" },
            { id: "biometrics", label: "Biometrics" },
            { id: "ead-ap-card", label: "EAD / Advance Parole" },
            { id: "interview-prep", label: "Interview prep" },
            { id: "interview-day", label: "Interview day" },
            { id: "next-steps", label: "After approval" },
        ],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
];

/* flat list of all sections for prev/next navigation */
const ALL_SECTIONS = PHASES.flatMap(p => p.sections.map(s => ({ ...s, phaseId: p.id })));

type CompletedState = {
    phases: Record<string, boolean>;
    sections: Record<string, Record<string, boolean>>;
    items: Record<string, Record<string, boolean>>;
};

const DEFAULT_STATE: CompletedState = { phases: {}, sections: {}, items: {} };

/* ─── helpers ─── */
function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
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

/* ─── section content components ─── */

function SectionDetermineEligibility() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Determine eligibility</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 1: Get Ready — Confirm you meet the requirements before investing time in paperwork.</p>
            </div>
            <p className="text-sm text-slate-600">
                Before you begin, confirm you meet the basic requirements for a marriage-based green card (Adjustment of Status).
                Check every item below — if any do not apply to your situation, consult an immigration attorney before proceeding.
            </p>
        </div>
    );
}

function SectionGatherDocuments() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Gather personal documents</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 1: Get Ready — Collect all required identity and civil documents.</p>
            </div>
            <Tip>Start gathering documents now — obtaining certified copies and translations from abroad can take weeks.</Tip>
            <p className="text-sm text-slate-600">
                Collect original or certified copies of every document below. Foreign-language documents must be accompanied
                by a certified English translation. Make photocopies of everything — you will send copies and keep originals
                for the interview.
            </p>
        </div>
    );
}

function SectionRelationshipEvidence() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Build relationship evidence</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 1: Get Ready — Demonstrate that your marriage is genuine.</p>
            </div>
            <Tip>
                Start collecting evidence now — USCIS looks for variety and consistency over time.
                A single type of evidence (e.g., only photos) is not enough. Aim for at least 4–5 different categories.
            </Tip>
            <p className="text-sm text-slate-600">
                Bona fide evidence is critical to your case. USCIS evaluates whether your marriage is genuine, not a
                marriage of convenience. The more variety and the longer the timeline your evidence spans, the stronger your case.
            </p>
        </div>
    );
}

function SectionMedicalExamPrep() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Schedule your medical exam</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 1: Get Ready — Book your I-693 appointment early.</p>
            </div>
            <Tip>
                Schedule your appointment as early as possible. Civil Surgeons book up quickly, and results can take
                1–2 weeks. You need the completed sealed envelope before you can mail your packet.
            </Tip>
            <p className="text-sm text-slate-600">
                Every applicant must complete a medical exam (Form I-693) performed by a USCIS-designated Civil Surgeon.
                The exam covers required vaccinations, TB screening, and other health checks. The doctor provides a
                sealed envelope that you include in your filing packet — do not open it.
            </p>
        </div>
    );
}

function SectionMedicalExamComplete() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Complete the medical exam</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — Attend your Civil Surgeon appointment and get the sealed I-693.</p>
            </div>
            <Warning>Do NOT open the sealed I-693 envelope under any circumstances. USCIS will reject an opened envelope.</Warning>
            <p className="text-sm text-slate-600">
                Attend your Civil Surgeon appointment with your passport and vaccination records. The doctor will perform
                the required exams and may schedule a follow-up visit (e.g., to read a TB skin test). When finished,
                you receive a sealed envelope containing Form I-693 — store it safely until packet assembly.
                The I-693 is valid for 2 years from the doctor's signature date.
            </p>
        </div>
    );
}

function SectionFormI130() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Form I-130 — Petition for Alien Relative</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — The petitioner (U.S. citizen spouse) files this to establish your family relationship.</p>
            </div>
            <Tip>The petitioner fills and signs I-130. The beneficiary does NOT sign this form — that is what I-130A is for.</Tip>
            <p className="text-sm text-slate-600">
                Form I-130 is the foundation of your petition. The U.S. citizen spouse (petitioner) submits it to
                establish that a qualifying family relationship exists. It is filed concurrently with I-485 for
                Adjustment of Status.
            </p>
            <ActionLink href="/dashboard/forms">Open Forms Page</ActionLink>
        </div>
    );
}

function SectionFormI130A() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Form I-130A — Supplemental Information</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — Biographical history submitted by the beneficiary alongside I-130.</p>
            </div>
            <p className="text-sm text-slate-600">
                Form I-130A is completed by the beneficiary (the immigrant spouse) and filed together with I-130.
                It requires a full 5-year residential and employment history with no gaps. If there are gaps,
                explain them (e.g., "unemployed" or "between addresses") — never leave unexplained blank periods.
            </p>
            <ActionLink href="/dashboard/forms">Open Forms Page</ActionLink>
        </div>
    );
}

function SectionFormI485() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Form I-485 — Application to Register Permanent Residence</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — The core Adjustment of Status application filed by the beneficiary.</p>
            </div>
            <Warning>
                Answer ALL questions on I-485 honestly, including those about unlawful presence and unauthorized employment.
                Misrepresentation is grounds for permanent inadmissibility.
            </Warning>
            <p className="text-sm text-slate-600">
                I-485 is the primary application for changing the beneficiary's status to Lawful Permanent Resident.
                It is a long form — read every question carefully and answer N/A if something does not apply.
                The filing fee ($1,440) covers biometrics and is non-refundable.
            </p>
            <ActionLink href="/dashboard/forms">Open Forms Page</ActionLink>
        </div>
    );
}

function SectionFormI864() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Form I-864 — Affidavit of Support</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — The petitioner pledges financial responsibility for the beneficiary.</p>
            </div>
            <Tip>
                If the petitioner's income alone does not reach 125% of the federal poverty guideline,
                a joint sponsor can file a separate I-864 using their own income — independently, not combined.
                Check the current threshold at uscis.gov/i-864p.
            </Tip>
            <p className="text-sm text-slate-600">
                The Affidavit of Support legally binds the petitioner to financially support the beneficiary
                above 125% of the federal poverty level. USCIS requires recent tax transcripts, W-2s, and
                an employer letter to verify income. Every field must be completed — blank fields are a
                common cause of RFEs (Requests for Evidence).
            </p>
        </div>
    );
}

function SectionFormI765I131() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Forms I-765 & I-131 — Work Authorization & Travel Document</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 2: Application — Filed concurrently to allow the beneficiary to work and travel while AOS is pending.</p>
            </div>
            <Warning>
                Do NOT travel internationally while I-485 is pending without the Advance Parole document in hand.
                Leaving the U.S. without it will abandon your I-485 application.
            </Warning>
            <p className="text-sm text-slate-600">
                <strong>I-765 (Employment Authorization Document):</strong> Allows the beneficiary to work legally in the U.S. while
                the green card is pending. Category (c)(9) applies to AOS applicants based on marriage to a U.S. citizen.
            </p>
            <p className="text-sm text-slate-600">
                <strong>I-131 (Advance Parole):</strong> Allows the beneficiary to travel outside the U.S. and return without
                abandoning the pending I-485. Both documents typically arrive together as a combo card within 3–5 months.
            </p>
            <ActionLink href="/dashboard/forms">Open Forms Page</ActionLink>
        </div>
    );
}

function SectionDocumentationBundle() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Assemble the documentation bundle</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 3: Submission — Stack all forms and documents in the correct order before mailing.</p>
            </div>
            <p className="text-sm text-slate-600">
                Assemble your entire packet in the order below, top to bottom. Use binder clips — not staples — to
                hold each section together. Make a complete photocopy of the assembled packet before sealing the envelope.
            </p>
            <div className="space-y-1">
                {[
                    { pos: 1, item: "Cover letter", note: "List every enclosed form and document" },
                    { pos: 2, item: "Form G-1145", note: "E-notification of acceptance — clip to very top" },
                    { pos: 3, item: "Filing fee payments", note: "Separate checks for each form (I-130: $675, I-485: $1,440, I-765: $260, I-131: $630)" },
                    { pos: 4, item: "Form I-130 + supporting docs", note: "Citizenship proof, marriage certificate, 2 photos each spouse" },
                    { pos: 5, item: "Form I-130A + supporting docs", note: "Passport copy, I-94, birth certificate + translation" },
                    { pos: 6, item: "Form I-485 + 2 photos + I-693", note: "Sealed medical exam envelope on top of I-485" },
                    { pos: 7, item: "Form I-864 (Petitioner)", note: "Tax transcript, W-2s, pay stubs, employer letter" },
                    { pos: 8, item: "Form I-864 (Joint Sponsor)", note: "Include only if joint sponsor is needed" },
                    { pos: 9, item: "Form I-765 (EAD) + 2 photos", note: "Employment Authorization application" },
                    { pos: 10, item: "Form I-131 (Advance Parole) + 2 photos", note: "Travel document application" },
                    { pos: 11, item: "Bona fide evidence packet", note: "Bank statements, utility bills, joint photos" },
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
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Printing & assembly rules</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 3: Submission — USCIS strictly enforces these rules. Violations result in packet rejection.</p>
            </div>
            <Warning>These rules are strictly enforced. A rejected packet resets your timeline and delays your case.</Warning>
            <div className="grid gap-3 sm:grid-cols-2">
                {[
                    { rule: "Print Single-Sided", desc: "All forms must be printed on one side of 8.5\" × 11\" paper only." },
                    { rule: "Binder Clips ONLY", desc: "Never use staples. Use binder clips to hold each form section." },
                    { rule: "Check or Money Order", desc: "Payable to 'U.S. Department of Homeland Security'. No cash accepted." },
                    { rule: "No Marks or Highlights", desc: "Do not highlight, circle, or write anything on any government form." },
                    { rule: "Current Edition Dates", desc: "Verify every form shows the current edition date before printing." },
                    { rule: "All Signatures Present", desc: "Every required signature field must be completed before mailing." },
                ].map((item) => (
                    <div key={item.rule} className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                        <p className="text-sm font-bold text-red-900">{item.rule}</p>
                        <p className="mt-1 text-xs text-red-700">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SectionMailing() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Mail your packet</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 3: Submission — Send your packet to the correct USCIS lockbox with tracking.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-2">USCIS Lockbox — Concurrent Filing (IL residents)</p>
                <p className="text-sm text-slate-600 mb-3">
                    The correct lockbox address depends on your state of residence. Verify the exact address for your state
                    at uscis.gov before mailing — addresses change and using the wrong address causes rejection.
                </p>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 font-mono">
                    USCIS Chicago Lockbox<br />
                    P.O. Box 805887<br />
                    Chicago, IL 60680-4120
                </div>
            </div>
            <Tip>
                Use USPS Certified Mail with Return Receipt (or Priority Mail with tracking). Save your tracking
                number — it is your only proof of submission until USCIS sends the I-797C receipt notice.
            </Tip>
        </div>
    );
}

function SectionTrackNotices() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Track your receipt notices</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: After Filing — Wait for I-797C notices confirming USCIS received your forms.</p>
            </div>
            <p className="text-sm text-slate-600">
                After USCIS receives your packet, they will mail an I-797C (Notice of Action) for each form filed.
                These receipts confirm your case was accepted and include receipt numbers you use to track your case online.
                Expect them 2–4 weeks after delivery. Set up a myUSCIS account to get online updates.
            </p>
        </div>
    );
}

function SectionBiometrics() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Biometrics appointment</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: After Filing — USCIS schedules fingerprints and a photo at an Application Support Center.</p>
            </div>
            <p className="text-sm text-slate-600">
                Shortly after receiving your receipt notices, USCIS will mail a separate I-797C scheduling your
                biometrics appointment at a local Application Support Center (ASC). The appointment takes about
                15–20 minutes. Bring your appointment notice and passport. Biometrics clear you for background checks.
            </p>
        </div>
    );
}

function SectionEadApCard() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">EAD / Advance Parole combo card</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: After Filing — Receive your work authorization and travel document while I-485 is pending.</p>
            </div>
            <Warning>
                Do NOT travel internationally until the Advance Parole card is physically in your hands.
                Departure without it while I-485 is pending will abandon your application.
            </Warning>
            <p className="text-sm text-slate-600">
                The EAD/AP combo card typically arrives within 3–5 months of filing. It authorizes the beneficiary
                to work in the U.S. (EAD) and travel abroad and return (Advance Parole) while the green card
                application is pending. Monitor myUSCIS for approval updates.
            </p>
        </div>
    );
}

function SectionInterviewPrep() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Prepare for your interview</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: After Filing — Both spouses must attend. Bring originals and updated evidence.</p>
            </div>
            <Tip>
                USCIS typically schedules AOS interviews 8–14 months after filing. Use that time to build
                more bona fide evidence — recent bank statements, joint travel, new photos.
            </Tip>
            <p className="text-sm text-slate-600">
                When your interview is scheduled, you will receive an I-797C with the date, time, and location
                of your local USCIS field office. Both spouses must attend. The officer will review your
                application, ask questions about your relationship, and may ask each spouse questions separately.
            </p>
        </div>
    );
}

function SectionInterviewDay() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Interview day</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: After Filing — The moment you have been preparing for.</p>
            </div>
            <p className="text-sm text-slate-600">
                Arrive early, bring everything, and answer honestly. The interview typically lasts 15–30 minutes.
                The officer places both spouses under oath. Questions cover your relationship, daily life,
                and the details in your application. If asked questions separately, stay consistent.
                If something is unclear, ask for clarification — it is allowed.
            </p>
        </div>
    );
}

function SectionNextSteps() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">After your interview</h2>
                <p className="mt-1 text-sm text-slate-500">Phase 4: After Filing — What to expect from approval through receiving your green card.</p>
            </div>
            <p className="text-sm text-slate-600">
                If approved at the interview, the officer will tell you verbally. Your green card will arrive
                by mail within 2–3 weeks. If your marriage is less than 2 years old at the time of approval,
                you receive a conditional green card (CR-1) valid for 2 years — you must file I-751 to remove
                the conditions before it expires. After 3 years as a permanent resident married to a U.S. citizen,
                you may be eligible to apply for naturalization.
            </p>
        </div>
    );
}

/* ─── section content registry ─── */
const SECTION_CONTENT: Record<string, () => React.ReactNode> = {
    "determine-eligibility": SectionDetermineEligibility,
    "gather-documents": SectionGatherDocuments,
    "relationship-evidence": SectionRelationshipEvidence,
    "medical-exam-prep": SectionMedicalExamPrep,
    "medical-exam-complete": SectionMedicalExamComplete,
    "form-i130": SectionFormI130,
    "form-i130a": SectionFormI130A,
    "form-i485": SectionFormI485,
    "form-i864": SectionFormI864,
    "form-i765-i131": SectionFormI765I131,
    "documentation-bundle": SectionDocumentationBundle,
    "instructions": SectionInstructions,
    "mailing": SectionMailing,
    "track-notices": SectionTrackNotices,
    "biometrics": SectionBiometrics,
    "ead-ap-card": SectionEadApCard,
    "interview-prep": SectionInterviewPrep,
    "interview-day": SectionInterviewDay,
    "next-steps": SectionNextSteps,
};

/* ─── main component ─── */
export function MyCaseTimeline() {
    const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({ "get-ready": true });
    const [activeSection, setActiveSection] = useState<string>("determine-eligibility");
    const [completed, setCompleted] = useState<CompletedState>(DEFAULT_STATE);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    /* load persisted state from DB on mount */
    useEffect(() => {
        fetch("/api/dashboard/timeline")
            .then(res => res.ok ? res.json() as Promise<{ items: Record<string, boolean> }> : null)
            .then(data => {
                if (!data?.items) return;
                // items from API is a flat map of "sectionId:itemId" → boolean
                // Reconstruct the nested items structure
                const nextItems: Record<string, Record<string, boolean>> = {};
                for (const [key, val] of Object.entries(data.items)) {
                    const sepIdx = key.indexOf(":");
                    if (sepIdx === -1) continue;
                    const sectionId = key.slice(0, sepIdx);
                    const itemId = key.slice(sepIdx + 1);
                    nextItems[sectionId] ??= {};
                    nextItems[sectionId][itemId] = val;
                }
                if (Object.keys(nextItems).length === 0) return;
                setCompleted(prev => {
                    const next = recomputePhaseCompletion({ ...prev, items: nextItems });
                    return next;
                });
            })
            .catch(() => { /* ignore — use default state */ });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ─── persistence helpers ─── */
    function persist(state: CompletedState) {
        // Flatten nested items map into "sectionId:itemId" → boolean for DB storage
        const flatItems: Record<string, boolean> = {};
        for (const [sectionId, sectionItems] of Object.entries(state.items)) {
            for (const [itemId, val] of Object.entries(sectionItems)) {
                flatItems[`${sectionId}:${itemId}`] = val;
            }
        }
        void fetch("/api/dashboard/timeline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: flatItems }),
        });
    }

    function recomputePhaseCompletion(state: CompletedState): CompletedState {
        const nextPhases = { ...state.phases };
        PHASES.forEach(phase => {
            const secMap = state.sections[phase.id] ?? {};
            const allDone = phase.sections.every(s => secMap[s.id]);
            nextPhases[phase.id] = allDone;
        });
        return { ...state, phases: nextPhases };
    }

    /* ─── toggle individual checklist item ─── */
    function toggleItem(sectionId: string, itemId: string) {
        setCompleted(prev => {
            const prevSectionItems = prev.items[sectionId] ?? {};
            const nextValue = !prevSectionItems[itemId];
            const nextSectionItems = { ...prevSectionItems, [itemId]: nextValue };
            const nextItems = { ...prev.items, [sectionId]: nextSectionItems };

            // auto-complete the section when all items are checked
            const allItems = SECTION_CHECKLISTS[sectionId] ?? [];
            const allChecked = allItems.length > 0 && allItems.every(item => nextSectionItems[item.id]);

            let nextSections = { ...prev.sections };
            if (allChecked) {
                const phase = PHASES.find(p => p.sections.some(s => s.id === sectionId));
                if (phase) {
                    nextSections = { ...nextSections, [phase.id]: { ...(nextSections[phase.id] ?? {}), [sectionId]: true } };
                }
            }

            const next = recomputePhaseCompletion({ ...prev, sections: nextSections, items: nextItems });
            persist(next);
            return next;
        });
    }

    /* ─── manually mark section complete ─── */
    function markSectionComplete(phaseId: string, sectionId: string) {
        setCompleted(prev => {
            const nextSections = { ...prev.sections, [phaseId]: { ...(prev.sections[phaseId] ?? {}), [sectionId]: true } };
            const next = recomputePhaseCompletion({ ...prev, sections: nextSections });
            persist(next);
            return next;
        });
    }

    /* ─── navigation ─── */
    function navigateToSection(phaseId: string, sectionId: string) {
        setExpandedPhases(prev => ({ ...prev, [phaseId]: true }));
        setActiveSection(sectionId);
        setMobileNavOpen(false);
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function handlePhaseClick(phaseId: string) {
        setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
    }

    function handleSectionClick(phaseId: string, sectionId: string) {
        navigateToSection(phaseId, sectionId);
    }

    function handleNext() {
        const parentPhase = PHASES.find(p => p.sections.some(s => s.id === activeSection));
        if (parentPhase) markSectionComplete(parentPhase.id, activeSection);

        const idx = ALL_SECTIONS.findIndex(s => s.id === activeSection);
        if (idx < ALL_SECTIONS.length - 1) {
            const next = ALL_SECTIONS[idx + 1];
            navigateToSection(next.phaseId, next.id);
        }
    }

    /* ─── derived values ─── */
    const activePhase = PHASES.find(p => p.sections.some(s => s.id === activeSection));
    const activeSectionLabel = activePhase?.sections.find(s => s.id === activeSection)?.label;
    const ActiveContent = SECTION_CONTENT[activeSection];
    const sectionChecklist = SECTION_CHECKLISTS[activeSection] ?? [];
    const sectionItemState = completed.items[activeSection] ?? {};
    const checkedCount = sectionChecklist.filter(item => sectionItemState[item.id]).length;
    const totalCount = sectionChecklist.length;

    /* ─── overall progress ─── */
    const totalSections = ALL_SECTIONS.length;
    const completedSectionCount = PHASES.reduce((acc, phase) => {
        const secMap = completed.sections[phase.id] ?? {};
        return acc + phase.sections.filter(s => secMap[s.id]).length;
    }, 0);

    return (
        <div className="space-y-4">
            {/* overall progress bar */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex-1 rounded-full bg-slate-100 h-2">
                    <div
                        className="rounded-full bg-slate-900 h-2 transition-all duration-500"
                        style={{ width: `${(completedSectionCount / totalSections) * 100}%` }}
                    />
                </div>
                <span className="text-xs font-semibold text-slate-500 shrink-0">
                    {completedSectionCount}/{totalSections} sections
                </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                {/* mobile nav toggle */}
                <button
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50 lg:hidden"
                    onClick={() => setMobileNavOpen(o => !o)}
                >
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{activePhase?.title}</p>
                        <p className="truncate text-sm font-semibold text-slate-900">{activeSectionLabel}</p>
                    </div>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`ml-3 h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${mobileNavOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* sidebar nav */}
                <nav className={`space-y-4 ${mobileNavOpen ? "block" : "hidden"} lg:block`}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Timeline</p>
                    {PHASES.map((phase, i) => {
                        const isExpanded = !!expandedPhases[phase.id];
                        const isDone = !!completed.phases[phase.id];
                        const isLast = i === PHASES.length - 1;

                        return (
                            <div key={phase.id} className="relative">
                                {!isLast && (
                                    <div className={`absolute left-[31px] top-[48px] w-[2px] transition-all duration-300 ${isExpanded ? "h-[calc(100%_-_12px)]" : "h-[calc(100%_-_24px)]"} bg-slate-200`} />
                                )}

                                <button
                                    onClick={() => handlePhaseClick(phase.id)}
                                    className={`relative flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all ${isExpanded
                                        ? "bg-white shadow-sm ring-1 ring-slate-200"
                                        : "hover:bg-slate-50"
                                        }`}
                                >
                                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${isDone
                                        ? "bg-slate-200 text-slate-700"
                                        : isExpanded
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-500"
                                        }`}>
                                        {isDone ? <CheckIcon /> : phase.icon}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${isExpanded ? "text-slate-900" : "text-slate-700"}`}>
                                                {phase.title}
                                            </span>
                                            {isDone && (
                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-600/20">
                                                    Done
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{phase.subtitle}</p>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="relative ml-[56px] mb-3 pr-2 flex flex-col gap-2">
                                        {phase.sections.map((section, idx) => {
                                            const isActive = activeSection === section.id;
                                            const isDoneSection = !!(completed.sections[phase.id]?.[section.id]);
                                            const isLastSection = idx === phase.sections.length - 1;

                                            // calculate item progress for this section
                                            const items = SECTION_CHECKLISTS[section.id] ?? [];
                                            const checkedItems = items.filter(item => completed.items[section.id]?.[item.id]).length;
                                            const hasPartialProgress = checkedItems > 0 && checkedItems < items.length;

                                            return (
                                                <div key={section.id} className="relative">
                                                    <div className="absolute left-[-25px] top-0 h-1/2 w-[2px] bg-slate-200" aria-hidden />
                                                    {!isLastSection && <div className="absolute left-[-25px] top-1/2 bottom-[-10px] w-[2px] bg-slate-200" aria-hidden />}
                                                    <div className="absolute left-[-25px] top-1/2 w-[25px] h-[2px] -translate-y-1/2 bg-slate-200" aria-hidden />

                                                    <button
                                                        onClick={() => handleSectionClick(phase.id, section.id)}
                                                        className={`relative w-full text-left rounded-lg border px-3 py-2 text-xs transition-colors flex items-center justify-between ${isActive
                                                            ? "border-slate-300 bg-white font-semibold text-slate-900 shadow-sm"
                                                            : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-700"
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isDoneSection
                                                                ? "border-slate-400 bg-slate-100 text-slate-700"
                                                                : hasPartialProgress
                                                                    ? "border-slate-400 bg-slate-50"
                                                                    : "border-slate-300 bg-white text-slate-300"
                                                                }`}>
                                                                {isDoneSection ? <CheckIcon className="h-3 w-3" /> : null}
                                                            </span>
                                                            <span>{section.label}</span>
                                                        </span>
                                                        {hasPartialProgress && !isDoneSection && items.length > 0 && (
                                                            <span className="text-[10px] text-slate-400 shrink-0">{checkedItems}/{items.length}</span>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* content panel */}
                <div ref={contentRef} className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 overflow-y-auto">
                    {/* section content */}
                    {ActiveContent && <ActiveContent />}

                    {/* checklist */}
                    {sectionChecklist.length > 0 && (
                        <div className="mt-8 space-y-3">
                            {/* progress bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 rounded-full bg-slate-100 h-1.5">
                                    <div
                                        className="rounded-full bg-slate-900 h-1.5 transition-all duration-300"
                                        style={{ width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : "0%" }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 shrink-0">{checkedCount}/{totalCount}</span>
                            </div>

                            {/* items */}
                            <div className="space-y-2">
                                {sectionChecklist.map((item) => {
                                    const checked = !!sectionItemState[item.id];
                                    return (
                                        <label
                                            key={item.id}
                                            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${checked
                                                ? "border-slate-200 bg-slate-50"
                                                : "border-slate-200 bg-white hover:bg-slate-50"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer"
                                                checked={checked}
                                                onChange={() => toggleItem(activeSection, item.id)}
                                            />
                                            <span className={`text-sm leading-snug ${checked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                                {item.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* footer actions */}
                    <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-slate-500">
                            {checkedCount === totalCount && totalCount > 0
                                ? "All items complete ✓"
                                : totalCount > 0
                                    ? `${totalCount - checkedCount} item${totalCount - checkedCount === 1 ? "" : "s"} remaining`
                                    : "Mark as complete to continue"
                            }
                        </div>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full rounded-full bg-[var(--color-trust)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-trust)] focus-visible:ring-offset-2 sm:w-auto"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";
import { asStepData } from "@/lib/case-step-data";
import { DASHBOARD_STEPS } from "@/lib/dashboard-steps";
import { FEES_2026, CONCURRENT_BUNDLE_TOTAL } from "@/lib/fee-schedule";
import { ScreenerMount } from "@/components/screener-mount";
import { CivilSurgeonWidget } from "@/components/civil-surgeon-widget";
import { DashboardCard, StatCard } from "@/components/ui/dashboard-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
    const context = await getCurrentUserAndProfileWithCaseSteps();
    const userName = context?.userProfile.fullName?.split(" ")[0] || "User";

    const caseSteps = context?.userProfile.caseSteps ?? [];
    const totalSteps = DASHBOARD_STEPS.length;
    const completedSteps = caseSteps.filter((s: { status: string }) => s.status === "COMPLETED").length;
    const inProgressSteps = caseSteps.filter((s: { status: string }) => s.status === "IN_PROGRESS").length;
    const notStartedSteps = totalSteps - completedSteps - inProgressSteps;
    const overallPercent = Math.round((completedSteps / totalSteps) * 100);

    const immigrationStep = caseSteps.find((s: { stepSlug: string }) => s.stepSlug === "immigration-info");
    const immigrationData = asStepData(immigrationStep?.data);
    const showScreener = !immigrationData.entryType;

    return (
        <div className="space-y-8">
            {showScreener && <ScreenerMount />}
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hello, {userName} 👋</h1>
                <p className="mt-2 text-base text-slate-500">
                    Here&apos;s what&apos;s happening with your immigration case today.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-3">
                <StatCard
                    title="Completed Steps"
                    value={completedSteps}
                    subtitle={`Out of ${totalSteps} total`}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    }
                />
                <StatCard
                    title="In Progress"
                    value={inProgressSteps}
                    subtitle="Currently working on"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Pending"
                    value={notStartedSteps}
                    subtitle="Yet to start"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    }
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column: Progress & Steps */}
                <div className="space-y-6">
                    <DashboardCard title="Overall Progress" subtitle={`${completedSteps} of ${totalSteps} steps completed`}>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Completion</span>
                                <span className="text-sm font-bold text-primary">{overallPercent}%</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                                    style={{ width: `${overallPercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Step Breakdown</h4>
                            {DASHBOARD_STEPS.map((step) => {
                                const saved = caseSteps.find((s: { stepSlug: string }) => s.stepSlug === step.slug);
                                const status = (saved as { status?: string } | undefined)?.status ?? "NOT_STARTED";
                                const percent = status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? 50 : 0;
                                const statusLabel =
                                    status === "COMPLETED" ? "Completed" :
                                        status === "IN_PROGRESS" ? "In progress" : "Pending";
                                const statusColor =
                                    status === "COMPLETED" ? "text-emerald-700 bg-emerald-50 ring-emerald-600/20" :
                                        status === "IN_PROGRESS" ? "text-blue-700 bg-blue-50 ring-blue-600/20" : "text-slate-600 bg-slate-50 ring-slate-500/10";
                                const barColor =
                                    status === "COMPLETED" ? "bg-emerald-500" :
                                        status === "IN_PROGRESS" ? "bg-blue-500" : "bg-slate-200";

                                return (
                                    <div key={step.slug} className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="w-full sm:w-40 shrink-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{step.title}</p>
                                        </div>
                                        <div className="flex-1 hidden sm:block">
                                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${percent}%` }} />
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColor} shrink-0 w-max`}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </DashboardCard>
                </div>

                {/* Right Column: Quick Actions & Overview */}
                <div className="space-y-6">
                    <DashboardCard title="Preparation & Next Steps" subtitle="Actions grouped by phase">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Link href="/dashboard/documents/gather" className="group relative rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">Gather Documents</h3>
                                <p className="text-sm text-slate-500">Checklist of evidence and forms you need to collect.</p>
                            </Link>

                            <Link href="/dashboard/interview" className="group relative rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">Interview Prep</h3>
                                <p className="text-sm text-slate-500">Tips, study guides, and common questions.</p>
                            </Link>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="2026 Filing Fee Overview" subtitle="Fees effective Jan 2026 (USCIS)">
                        <div className="space-y-3">
                            {[
                                { label: "I-485 (Adjustment of Status)", amount: FEES_2026.i485 },
                                { label: "I-130 (Petition for Alien Relative)", amount: FEES_2026.i130_paper },
                                { label: "I-765 (Employment Authorization)", amount: FEES_2026.ead_initial },
                                { label: "Biometrics", amount: FEES_2026.biometrics },
                            ].map(({ label, amount }) => (
                                <div key={label} className="flex justify-between text-sm items-center">
                                    <span className="text-slate-600">{label}</span>
                                    <span className="font-semibold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                        {amount === 0 ? "Waived" : `$${amount.toLocaleString()}`}
                                    </span>
                                </div>
                            ))}
                            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 items-center">
                                <span className="font-semibold text-slate-900">Total Bundle</span>
                                <span className="text-2xl font-bold tracking-tight text-primary">
                                    ${CONCURRENT_BUNDLE_TOTAL.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="I-693 Medical Exam" subtitle="Find a USCIS Civil Surgeon near you">
                        <CivilSurgeonWidget />
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
}

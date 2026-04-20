import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { InterviewClient } from "./interview-client";

export const dynamic = "force-dynamic";

export default async function InterviewPrepPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">My Case</p>
        <h1 className="text-2xl font-bold text-slate-900">Interview Preparation</h1>
        <p className="text-sm text-slate-600 truncate">
          Review common questions, prepare for your interview day, and make sure you have everything ready.
        </p>
      </div>
      <InterviewClient userRole={context.userProfile.role} />
    </div>
  );
}

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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Interview Preparation</h1>
      <p className="text-sm text-slate-500 mb-8">
        Review common questions, prepare for your interview day, and make sure you have everything ready.
      </p>
      <InterviewClient userRole={context.userProfile.role} />
    </div>
  );
}

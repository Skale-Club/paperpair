export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { FORM_PACKS } from "@/lib/form-packs";
import { SubmissionClient } from "./submission-client";

export default async function SubmissionPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) redirect("/login");

  // Serialize only the fields needed by the client component to avoid
  // passing Date objects (lockedUntil) across the Server/Client boundary.
  const serializedPacks = FORM_PACKS.map(({ id, label, detailLabel, coverPdfUrl, uscisUrl }) => ({
    id,
    label,
    detailLabel,
    coverPdfUrl,
    uscisUrl,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Ready to Submit</h1>
      <p className="mb-8 text-sm text-slate-500">
        Download your completed forms, assemble the packet, confirm the USCIS mailing
        address, and review the Advance Parole travel warning before sending.
      </p>
      <SubmissionClient formPacks={serializedPacks} />
    </div>
  );
}

export const dynamic = "force-dynamic";

import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { redirect } from "next/navigation";
import { DocumentsClient } from "./documents-client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type DocumentRecord = {
  id: string;
  filename: string;
  docType: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  signedUrl: string | null;
};

export default async function DocumentsPage() {
  const context = await getCurrentUserAndProfile();
  if (!context) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userProfileId: context.userProfile.id },
    orderBy: { uploadedAt: "desc" },
  });

  const supabase = await createClient();

  const documentsWithUrls: DocumentRecord[] = await Promise.all(
    documents.map(async (doc) => {
      const { data: signedData } = await supabase.storage
        .from("user-documents")
        .createSignedUrl(doc.storagePath, 3600);
      return {
        id: doc.id,
        filename: doc.filename,
        docType: doc.docType,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        uploadedAt: doc.uploadedAt.toISOString(),
        signedUrl: signedData?.signedUrl ?? null,
      };
    })
  );

  return <DocumentsClient initialDocuments={documentsWithUrls} />;
}

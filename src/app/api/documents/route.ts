import { NextResponse } from "next/server";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userProfileId: context.userProfile.id },
    orderBy: { uploadedAt: "desc" },
  });

  const supabase = await createClient();

  // Generate signed URLs for each document (1-hour TTL per D-10)
  const documentsWithUrls = await Promise.all(
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

  return NextResponse.json({ documents: documentsWithUrls });
}

export async function DELETE(request: Request) {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("id");

  if (!documentId) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  }

  // Ownership check — only the owner can delete their document
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (document.userProfileId !== context.userProfile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove from Supabase Storage (use exact storagePath — per Pitfall 6 in RESEARCH.md)
  const supabase = await createClient();
  await supabase.storage.from("user-documents").remove([document.storagePath]);

  // Delete DB record
  await prisma.document.delete({ where: { id: documentId } });

  return NextResponse.json({ success: true });
}

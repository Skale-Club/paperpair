import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const context = await getCurrentUserAndProfile();

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filename = params.filename;

  // Reject path traversal attempts and non-PDF filenames.
  if (!filename || !/^[\w.-]+\.pdf$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  // Verify this PDF was generated for the authenticated user.
  // Files are stored as `{userId}-{templateKey}-{timestamp}.pdf`.
  if (!filename.startsWith(`${context.user.id}-`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filePath = path.join(process.cwd(), "private", "generated", filename);

  let bytes: Buffer;
  try {
    bytes = await readFile(filePath);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}

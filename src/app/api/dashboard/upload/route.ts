import { StepStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { asStepData } from "@/lib/case-step-data";
import { isDashboardStepSlug } from "@/lib/dashboard-steps";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

type UploadedFile = {
  name: string;
  path: string;
  uploadedAt: string;
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isUploadedFile(value: unknown): value is UploadedFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UploadedFile>;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.path === "string" &&
    typeof candidate.uploadedAt === "string"
  );
}

function extractFiles(data: Record<string, unknown>): UploadedFile[] {
  const candidate = data.files;

  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate.filter(isUploadedFile);
}

export async function POST(request: Request) {
  const context = await getCurrentUserAndProfile();

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const stepSlug = String(formData.get("stepSlug") ?? "").trim();

  if (!stepSlug || !isDashboardStepSlug(stepSlug)) {
    return NextResponse.json({ error: "Invalid stepSlug" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid type. Please upload PDF, JPG, or PNG." },
      { status: 400 }
    );
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File must be 10MB or less." }, { status: 400 });
  }

  const supabase = await createClient();

  const safeName = sanitizeFilename(file.name);
  const storagePath = `${context.user.id}/${stepSlug}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("user-documents")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed", details: uploadError.message },
      { status: 500 }
    );
  }

  const existingStep = await prisma.caseStep.findUnique({
    where: {
      userProfileId_stepSlug: {
        userProfileId: context.userProfile.id,
        stepSlug
      }
    }
  });

  const existingData = asStepData(existingStep?.data);
  const existingFiles = extractFiles(existingData);

  const uploadedFile: UploadedFile = {
    name: file.name,
    path: storagePath,
    uploadedAt: new Date().toISOString()
  };

  const mergedData: Record<string, unknown> = {
    ...existingData,
    files: [...existingFiles, uploadedFile]
  };

  await prisma.caseStep.upsert({
    where: {
      userProfileId_stepSlug: {
        userProfileId: context.userProfile.id,
        stepSlug
      }
    },
    create: {
      userProfileId: context.userProfile.id,
      stepSlug,
      status: StepStatus.IN_PROGRESS,
      data: JSON.stringify(mergedData)
    },
    update: {
      status: StepStatus.IN_PROGRESS,
      data: JSON.stringify(mergedData)
    }
  });

  return NextResponse.json({
    success: true,
    file: uploadedFile
  });
}

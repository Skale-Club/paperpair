import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { StepStatus } from "@prisma/client";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { asStepData } from "@/lib/case-step-data";
import { EXTRACTABLE_DOC_TYPES } from "@/lib/document-types";
import { getLanguageModel } from "@/lib/ai/providers";

const RequestSchema = z.object({
  documentId: z.string().min(1),
});

export async function POST(request: Request) {
  const context = await getCurrentUserAndProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  const { documentId } = parsed.data;

  // Fetch document and verify ownership
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (document.userProfileId !== context.userProfile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate extractable type — per D-08/D-09
  if (!EXTRACTABLE_DOC_TYPES.includes(document.docType as (typeof EXTRACTABLE_DOC_TYPES)[number])) {
    return NextResponse.json(
      { error: "This document type does not support extraction" },
      { status: 400 }
    );
  }

  // Download file from Supabase Storage
  const supabase = await createClient();
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("user-documents")
    .download(document.storagePath);

  if (downloadError || !fileData) {
    return NextResponse.json(
      { error: "Could not retrieve document for extraction" },
      { status: 500 }
    );
  }

  // Read file as base64 for AI SDK
  const arrayBuffer = await fileData.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = document.mimeType as "application/pdf" | "image/jpeg" | "image/png";

  // Build extraction prompt based on document type
  const extractionPrompt = buildExtractionPrompt(document.docType);

  // Get model using the same provider selection as chat route
  let model;
  try {
    model = await getLanguageModel("google/gemini-2.0-flash");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Model not available";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model,
      system: extractionPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: base64Data,
              mediaType: mediaType,
            },
            {
              type: "text",
              text: "Please extract the requested fields from this document and return them as a JSON object.",
            },
          ],
        },
      ],
    });

    // Parse extracted fields from AI response
    let extractedFields: Record<string, string> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedFields = JSON.parse(jsonMatch[0]) as Record<string, string>;
      }
    } catch {
      extractedFields = {};
    }

    // Save to immigration-info CaseStep — merge with existing data per Phase 1 pattern
    const existingStep = await prisma.caseStep.findUnique({
      where: {
        userProfileId_stepSlug: {
          userProfileId: context.userProfile.id,
          stepSlug: "immigration-info",
        },
      },
    });
    const existingData = asStepData(existingStep?.data);

    await prisma.caseStep.upsert({
      where: {
        userProfileId_stepSlug: {
          userProfileId: context.userProfile.id,
          stepSlug: "immigration-info",
        },
      },
      create: {
        userProfileId: context.userProfile.id,
        stepSlug: "immigration-info",
        status: StepStatus.IN_PROGRESS,
        data: JSON.stringify({ ...extractedFields }),
      },
      update: {
        data: JSON.stringify({ ...existingData, ...extractedFields }),
      },
    });

    return NextResponse.json({ success: true, fields: extractedFields });
  } catch (err) {
    console.error("Extraction error:", err);
    return NextResponse.json(
      { error: "Extraction failed. Try again or enter the information manually." },
      { status: 500 }
    );
  }
}

function buildExtractionPrompt(docType: string): string {
  const base = `You are a document data extraction assistant. Extract the requested fields from the provided document image or PDF. Return ONLY a valid JSON object — no other text, no markdown, no explanation. Use null for any field you cannot find.`;

  const fieldMap: Record<string, string> = {
    passport: `${base}\n\nExtract these fields: { "fullName": "<full name as printed>", "dateOfBirth": "<MM/DD/YYYY>", "passportNumber": "<passport number>", "nationality": "<country of citizenship>", "expiryDate": "<MM/DD/YYYY>" }`,
    "marriage-certificate": `${base}\n\nExtract these fields: { "marriageDate": "<MM/DD/YYYY>", "fullName": "<applicant full name>", "spouseFullName": "<spouse full name>", "marriageCity": "<city>", "marriageState": "<state or country>" }`,
    "birth-certificate": `${base}\n\nExtract these fields: { "fullName": "<full name on certificate>", "dateOfBirth": "<MM/DD/YYYY>", "birthCity": "<city of birth>", "birthState": "<state of birth>", "birthCountry": "<country of birth>" }`,
  };

  return fieldMap[docType] ?? base;
}

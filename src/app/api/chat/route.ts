import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";
import { fillPdfTemplate } from "@/lib/pdf";
import { getClientIpFromHeaders, runRateLimit } from "@/lib/rate-limit";
import { getUserGoogleApiKey } from "@/lib/supabase/user-ai-keys";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1)
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1),
  selectedTemplateKeys: z.array(z.string().min(1)).optional()
});

const requiredFields = [
  "fullName",
  "dateOfBirth",
  "email",
  "phone",
  "currentAddress",
  "spouseFullName",
  "marriageDate",
  "entryDateUsa",
  "i94Number"
] as const;

type StructuredData = Record<(typeof requiredFields)[number], string>;

function emptyStructuredData(): StructuredData {
  return {
    fullName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    currentAddress: "",
    spouseFullName: "",
    marriageDate: "",
    entryDateUsa: "",
    i94Number: ""
  };
}

function getMissingFields(data: StructuredData) {
  return requiredFields.filter((field) => !data[field]);
}

function parseHeuristic(messages: Array<{ role: "user" | "assistant"; content: string }>): StructuredData {
  const data = emptyStructuredData();
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n")
    .toLowerCase();

  const email = userText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] ?? "";
  const phone = userText.match(/(?:\+1\s?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/)?.[0] ?? "";

  data.email = email;
  data.phone = phone;

  return data;
}

async function callGoogleModel(
  apiKey: string,
  prompt: string,
  options?: {
    responseMimeType?: "application/json" | "text/plain";
    temperature?: number;
  }
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0,
          responseMimeType: options?.responseMimeType ?? "text/plain"
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error("Google model request failed");
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

async function extractWithGoogle(
  googleApiKey: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<StructuredData> {
  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const raw = await callGoogleModel(
    googleApiKey,
    [
      "Extract case data and return valid JSON only.",
      "Required keys: fullName,dateOfBirth,email,phone,currentAddress,spouseFullName,marriageDate,entryDateUsa,i94Number.",
      "Use an empty string for missing values.",
      "Conversation transcript:",
      transcript
    ].join("\n"),
    {
      responseMimeType: "application/json",
      temperature: 0
    }
  );
  const parsed = JSON.parse(raw) as Partial<StructuredData>;
  const merged = emptyStructuredData();

  for (const key of requiredFields) {
    merged[key] = String(parsed[key] ?? "").trim();
  }

  return merged;
}

async function generateAssistantReply(
  googleApiKey: string | null,
  extractedData: StructuredData,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const missing = getMissingFields(extractedData);
  if (!googleApiKey) {
    if (!missing.length) {
      return "Great. We already have all essential data. If you want, type 'generate pdf'.";
    }
    return `Thanks. Still missing: ${missing.join(", ")}. Please share the next detail.`;
  }

  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const reply = await callGoogleModel(
    googleApiKey,
    [
      "You are a data-intake assistant for marriage-based Adjustment of Status.",
      "Ask the next concise question to collect only missing fields.",
      "If nothing is missing, ask the user to type 'generate pdf'.",
      "Respond in English.",
      `Fields already extracted: ${JSON.stringify(extractedData)}`,
      "Transcript:",
      transcript
    ].join("\n"),
    {
      responseMimeType: "text/plain",
      temperature: 0.3
    }
  );

  return reply || "Please share the next detail.";
}

async function generatePdfs(data: StructuredData, selectedTemplateKeys: string[], userId: string) {
  const templates = await prisma.documentTemplate.findMany({
    where: selectedTemplateKeys.length ? { key: { in: selectedTemplateKeys } } : undefined
  });
  const generatedFiles: Array<{ key: string; url: string }> = [];

  if (!templates.length) {
    return generatedFiles;
  }

  // Store outside /public so Next.js never serves these statically.
  // Files are scoped by userId and served only through the auth-gated
  // /api/dashboard/pdf/[filename] route.
  const generatedDir = path.join(process.cwd(), "private", "generated");
  await mkdir(generatedDir, { recursive: true });

  for (const template of templates) {
    try {
      const templatePath = path.join(process.cwd(), "public", template.filePath);
      const templateBytes = await readFile(templatePath);
      const filledBytes = await fillPdfTemplate(templateBytes, data);

      // Prefix with userId so the download route can verify ownership.
      const filename = `${userId}-${template.key}-${Date.now()}.pdf`;
      const outputPath = path.join(generatedDir, filename);
      await writeFile(outputPath, Buffer.from(filledBytes));

      generatedFiles.push({
        key: template.key,
        url: `/api/dashboard/pdf/${encodeURIComponent(filename)}`
      });
    } catch {
      // Continue for other templates even if one file is missing or corrupt.
    }
  }

  return generatedFiles;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIpFromHeaders(request.headers);
  const rateLimit = runRateLimit({
    key: `chat:${clientIp}`,
    windowMs: 60_000,
    max: 30,
    blockDurationMs: 5 * 60_000
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  const parsedBody = BodySchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const messages = parsedBody.data.messages;
  const selectedTemplateKeys = parsedBody.data.selectedTemplateKeys ?? [];
  const context = await getCurrentUserAndProfile();

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const googleApiKey = (await getUserGoogleApiKey(context.user.id))?.trim() || null;

  let extractedData = emptyStructuredData();

  try {
    extractedData = googleApiKey
      ? await extractWithGoogle(googleApiKey, messages)
      : parseHeuristic(messages);
  } catch {
    extractedData = parseHeuristic(messages);
  }

  const lastUserMessage = messages.filter((m) => m.role === "user").at(-1)?.content.toLowerCase() ?? "";
  const wantsPdf =
    lastUserMessage.includes("gerar pdf") ||
    lastUserMessage.includes("generate pdf") ||
    lastUserMessage.includes("finalizar");

  let generatedFiles: Array<{ key: string; url: string }> | undefined;

  if (wantsPdf) {
    generatedFiles = await generatePdfs(extractedData, selectedTemplateKeys, context.user.id);
  }

  const reply = await generateAssistantReply(googleApiKey, extractedData, messages);

  return NextResponse.json({
    reply,
    extractedData,
    generatedFiles
  });
}

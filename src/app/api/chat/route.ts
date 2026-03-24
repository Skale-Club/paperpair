import { streamText } from "ai";
import { NextRequest } from "next/server";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";
import { prisma } from "@/lib/prisma";
import { fillPdfTemplate } from "@/lib/pdf";
import { getClientIpFromHeaders, runRateLimit } from "@/lib/rate-limit";
import { getUserGoogleApiKey } from "@/lib/supabase/user-ai-keys";
import { getLanguageModel } from "@/lib/ai/providers";
import { systemPrompt } from "@/lib/ai/prompts";
import { allowedModelIds } from "@/lib/ai/models";

// Zod schemas for request validation
const UIMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z
    .array(
      z.object({
        type: z.string(),
        text: z.string().optional(),
      })
    )
    .optional(),
  content: z.string().optional(),
});

const BodySchema = z.object({
  messages: z.array(UIMessageSchema).min(1),
  selectedModelId: z.string().optional(),
  selectedTemplateKeys: z.array(z.string().min(1)).optional(),
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
  "i94Number",
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
    i94Number: "",
  };
}

function getMissingFields(data: StructuredData) {
  return requiredFields.filter((field) => !data[field]);
}

// Extract text from AI SDK UIMessage (supports parts format)
function extractTextFromMessage(msg: {
  role: string;
  parts?: Array<{ type: string; text?: string }>;
  content?: string;
}): string {
  if (msg.content) return msg.content;
  if (msg.parts) {
    return msg.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("");
  }
  return "";
}

function convertUIMessagesToLegacy(
  messages: Array<{
    role: string;
    parts?: Array<{ type: string; text?: string }>;
    content?: string;
  }>
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: extractTextFromMessage(m),
    }));
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

// Use user's Google API key for extraction (fallback if AI SDK provider fails)
async function extractWithGoogle(
  googleApiKey: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<StructuredData> {
  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(googleApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "Extract case data and return valid JSON only.",
                  "Required keys: fullName,dateOfBirth,email,phone,currentAddress,spouseFullName,marriageDate,entryDateUsa,i94Number.",
                  "Use an empty string for missing values.",
                  "Conversation transcript:",
                  transcript,
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Google extraction request failed");
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "{}";
  const parsed = JSON.parse(raw) as Partial<StructuredData>;
  const merged = emptyStructuredData();

  for (const key of requiredFields) {
    merged[key] = String(parsed[key] ?? "").trim();
  }

  return merged;
}

async function generatePdfs(
  data: StructuredData,
  selectedTemplateKeys: string[],
  userId: string
) {
  const templates = await prisma.documentTemplate.findMany({
    where: selectedTemplateKeys.length ? { key: { in: selectedTemplateKeys } } : undefined,
  });
  const generatedFiles: Array<{ key: string; url: string }> = [];

  if (!templates.length) return generatedFiles;

  const generatedDir = path.join(process.cwd(), "private", "generated");
  await mkdir(generatedDir, { recursive: true });

  for (const template of templates) {
    try {
      const templatePath = path.join(process.cwd(), "public", template.filePath);
      const templateBytes = await readFile(templatePath);
      const filledBytes = await fillPdfTemplate(templateBytes, data);

      const filename = `${userId}-${template.key}-${Date.now()}.pdf`;
      const outputPath = path.join(generatedDir, filename);
      await writeFile(outputPath, Buffer.from(filledBytes));

      generatedFiles.push({
        key: template.key,
        url: `/api/dashboard/pdf/${encodeURIComponent(filename)}`,
      });
    } catch {
      // Continue for other templates
    }
  }

  return generatedFiles;
}

// Determine the model to use based on selectedModelId
function getModel(modelId: string) {
  if (allowedModelIds.has(modelId)) {
    return getLanguageModel(modelId);
  }
  // Default fallback
  return getLanguageModel("google/gemini-2.0-flash");
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIpFromHeaders(request.headers);
  const rateLimit = runRateLimit({
    key: `chat:${clientIp}`,
    windowMs: 60_000,
    max: 30,
    blockDurationMs: 5 * 60_000,
  });

  if (!rateLimit.ok) {
    return new Response(JSON.stringify({ error: "Too many attempts. Try again shortly." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    });
  }

  // Parse request body
  let parsedBody;
  try {
    const json = await request.json();
    parsedBody = BodySchema.safeParse(json);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!parsedBody.success) {
    return new Response(JSON.stringify({ error: "Invalid payload", details: parsedBody.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, selectedModelId, selectedTemplateKeys } = parsedBody.data;

  // Auth check
  const context = await getCurrentUserAndProfile();
  if (!context) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Convert UIMessages to legacy format for data extraction
  const legacyMessages = convertUIMessagesToLegacy(messages);

  // Extract structured data
  const googleApiKey = (await getUserGoogleApiKey(context.user.id))?.trim() || null;
  let extractedData = emptyStructuredData();

  try {
    extractedData = googleApiKey
      ? await extractWithGoogle(googleApiKey, legacyMessages)
      : parseHeuristic(legacyMessages);
  } catch {
    extractedData = parseHeuristic(legacyMessages);
  }

  // Check for PDF generation intent
  const lastUserMessage = legacyMessages.filter((m) => m.role === "user").at(-1)?.content.toLowerCase() ?? "";
  const wantsPdf =
    lastUserMessage.includes("gerar pdf") ||
    lastUserMessage.includes("generate pdf") ||
    lastUserMessage.includes("finalizar");

  if (wantsPdf) {
    const generatedFiles = await generatePdfs(
      extractedData,
      selectedTemplateKeys ?? [],
      context.user.id
    );

    if (generatedFiles.length > 0) {
      const fileList = generatedFiles.map((f) => `- ${f.key}: ${f.url}`).join("\n");
      return new Response(
        JSON.stringify({
          role: "assistant",
          content: `I've generated your PDFs:\n${fileList}\n\nYou can download them from the sidebar.`,
          extractedData,
          generatedFiles,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Build system prompt with extraction context
  const missing = getMissingFields(extractedData);
  const dataContext = `Fields already collected: ${JSON.stringify(extractedData)}. Missing fields: ${missing.join(", ") || "none"}`;
  const fullSystemPrompt = `${systemPrompt}\n\n${dataContext}`;

  // Convert messages to AI SDK model messages format
  const modelMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: extractTextFromMessage(m),
  }));

  // Get the model from admin-configured keys
  const modelId = selectedModelId ?? "google/gemini-2.0-flash";
  if (!allowedModelIds.has(modelId)) {
    return new Response(JSON.stringify({ error: "Invalid model selected" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let model;
  try {
    model = await getLanguageModel(modelId, googleApiKey);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Model not available";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use AI SDK streamText for streaming responses
  const result = streamText({
    model,
    system: fullSystemPrompt,
    messages: modelMessages,
    temperature: 0.3,
  });

  return result.toUIMessageStreamResponse();
}

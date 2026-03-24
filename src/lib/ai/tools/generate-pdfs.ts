import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fillPdfTemplate } from "@/lib/pdf";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

export const extractDataSchema = z.object({
  fullName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  currentAddress: z.string().optional(),
  spouseFullName: z.string().optional(),
  marriageDate: z.string().optional(),
  entryDateUsa: z.string().optional(),
  i94Number: z.string().optional(),
});

export const generatePdfsSchema = z.object({
  templateKeys: z.array(z.string()).describe("Document template keys to generate"),
});

type StructuredData = z.infer<typeof extractDataSchema>;

export async function generatePdfs(
  data: StructuredData,
  selectedTemplateKeys: string[],
  userId: string
): Promise<Array<{ key: string; url: string }>> {
  const templates = await prisma.documentTemplate.findMany({
    where: selectedTemplateKeys.length ? { key: { in: selectedTemplateKeys } } : undefined,
  });

  const generatedFiles: Array<{ key: string; url: string }> = [];

  if (!templates.length) {
    return generatedFiles;
  }

  const generatedDir = path.join(process.cwd(), "private", "generated");
  await mkdir(generatedDir, { recursive: true });

  for (const template of templates) {
    try {
      const templatePath = path.join(process.cwd(), "public", template.filePath);
      const templateBytes = await readFile(templatePath);
      const filledBytes = await fillPdfTemplate(templateBytes, data as Record<string, string>);

      const filename = `${userId}-${template.key}-${Date.now()}.pdf`;
      const outputPath = path.join(generatedDir, filename);
      await writeFile(outputPath, Buffer.from(filledBytes));

      generatedFiles.push({
        key: template.key,
        url: `/api/dashboard/pdf/${encodeURIComponent(filename)}`,
      });
    } catch {
      // Continue for other templates even if one file is missing or corrupt
    }
  }

  return generatedFiles;
}

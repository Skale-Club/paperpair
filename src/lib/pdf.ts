import { PDFDocument } from "pdf-lib";

/** The only USCIS-accepted I-485 edition for 2026 concurrent filings */
export const VALID_I485_EDITION = "01/20/25";

/**
 * Asserts that the PDF being generated uses the correct I-485 edition.
 * Throws if the edition does not match the locked value.
 */
export function lockFormEdition(editionDate: string): void {
  if (editionDate !== VALID_I485_EDITION) {
    throw new Error(
      `Form edition mismatch: expected ${VALID_I485_EDITION}, got ${editionDate}. ` +
        `Update the form template to the current USCIS-required edition.`
    );
  }
}

/**
 * Non-required fields must never be blank on a USCIS form submission.
 * This prevents automatic rejections for empty fields.
 */
export function sanitizeField(value: string | undefined, required = false): string {
  if (value && value.trim() !== "") return value.trim();
  if (required) return "";
  return "N/A";
}

export async function fillPdfTemplate(templateBytes: Uint8Array, data: Record<string, string>) {
  const pdfDoc = await PDFDocument.load(templateBytes);

  try {
    const form = pdfDoc.getForm();
    for (const [key, value] of Object.entries(data)) {
      if (!value) continue;
      try {
        const field = form.getTextField(key);
        field.setText(value);
      } catch {
        // Field not found in the PDF template; skip without breaking the flow.
      }
    }
    form.flatten();
  } catch {
    // PDF without an AcroForm; keep the original file.
  }

  return await pdfDoc.save();
}

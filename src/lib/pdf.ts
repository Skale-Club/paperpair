/**
 * PDF form filling utilities for USCIS immigration forms.
 * @module pdf
 */

import { PDFDocument } from "pdf-lib";

/** The only USCIS-accepted I-485 edition for 2026 concurrent filings */
export const VALID_I485_EDITION = "01/20/25";

/**
 * Asserts that the PDF being generated uses the correct I-485 edition.
 * Throws if the edition does not match the locked value.
 * 
 * @param editionDate - The edition date string from the PDF form (e.g., "01/20/25")
 * @throws {Error} If the edition does not match the required edition
 * 
 * @example
 * ```ts
 * lockFormEdition("01/20/25"); // OK
 * lockFormEdition("01/01/24"); // throws Error
 * ```
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
 * Sanitizes a field value for USCIS form submission.
 * Non-required fields must never be blank on a USCIS form submission.
 * This prevents automatic rejections for empty fields.
 * 
 * @param value - The field value (may be undefined or empty)
 * @param required - Whether the field is required (default: false)
 * @returns The sanitized value (trimmed, "N/A" for optional empty fields, or empty string for required empty fields)
 * 
 * @example
 * ```ts
 * sanitizeField("John Doe") // "John Doe"
 * sanitizeField(undefined) // "N/A"
 * sanitizeField("", true) // "" (required field stays empty)
 * ```
 */
export function sanitizeField(value: string | undefined, required = false): string {
  if (value && value.trim() !== "") return value.trim();
  if (required) return "";
  return "N/A";
}

/**
 * Fills a PDF template with the provided data.
 * 
 * @param templateBytes - The raw PDF file bytes
 * @param data - A key-value map of field names to values
 * @returns The filled PDF as Uint8Array
 * 
 * @example
 * ```ts
 * const pdfBytes = await readFile("template.pdf");
 * const filledPdf = await fillPdfTemplate(pdfBytes, {
 *   fullName: "John Doe",
 *   dateOfBirth: "1990-01-15"
 * });
 * ```
 */
export async function fillPdfTemplate(
  templateBytes: Uint8Array,
): Promise<Uint8Array> {
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

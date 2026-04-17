/**
 * @module mime
 * Magic byte MIME type detection for uploaded files.
 * Supported types match ALLOWED_TYPES in src/app/api/dashboard/upload/route.ts.
 */

/**
 * Inspects the first bytes of a file buffer and returns the detected MIME type,
 * or null if the bytes do not match a known supported format.
 *
 * Supported signatures:
 *   PDF  — %PDF (25 50 44 46)
 *   JPEG — FF D8 FF
 *   PNG  — 89 50 4E 47
 */
export function getMagicMime(bytes: Uint8Array): string | null {
  // PDF: %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf";
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return "image/png";
  }
  return null;
}

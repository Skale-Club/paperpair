/** @module document-types */
// Canonical list of 13 document type tags for the document upload system.
// D-09: tags defined in Phase 2 context.

export const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "birth-certificate", label: "Birth Certificate" },
  { value: "marriage-certificate", label: "Marriage Certificate" },
  { value: "divorce-decree", label: "Divorce Decree" },
  { value: "i-94", label: "I-94 Record" },
  { value: "visa", label: "Visa" },
  { value: "tax-return", label: "Tax Return" },
  { value: "bank-statement", label: "Bank Statement" },
  { value: "employment-letter", label: "Employment Letter" },
  { value: "police-clearance", label: "Police Clearance" },
  { value: "medical-exam", label: "Medical Exam (I-693)" },
  { value: "photo", label: "Passport Photo" },
  { value: "other", label: "Other" },
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number]["value"];

/** Document types that support AI field extraction (DOC-05).
 *  Only these types show the "Extract to profile" button in the UI.
 */
export const EXTRACTABLE_DOC_TYPES: DocumentType[] = [
  "passport",
  "marriage-certificate",
  "birth-certificate",
];
